import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { resetters } from "./storeReset";
import { get, set, del } from "idb-keyval";
import {
  executeReconciliation,
  applyAutoMatchEntities,
} from "../features/conciliation/utils/reconciliationEngine";
import { dedupeRemainingBankMovements } from "../features/conciliation/utils/bankMovementMetrics";
import {
  applyGroupToState,
  approveGroupInState,
  createConciliationGroup,
  removeGroupFromState,
} from "../features/conciliation/utils/conciliationGroupOps";
import type { ExtractInvoicesXmlResult } from "../features/conciliation/utils/extractInvoicesXml";
import type { BankMovement, InvoiceXML, ConciliationGroup, ExceptionType } from "../types";

const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export type ConciliationStep = "BANK_UPLOAD" | "INVOICE_UPLOAD" | "RESULTS";

export interface ConciliationSnapshot {
  id: string;
  title: string;
  rfcEmpresa?: string | null;
  matches: ConciliationGroup[];
  movements: BankMovement[];
  invoices: InvoiceXML[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];
}

export interface InvoiceUploadResult {
  success: boolean;
  addedCount?: number;
  error?: string;
}

interface ConciliationState {
  currentStep: ConciliationStep;
  activeConciliationId: string | null;
  activeConciliationTitle: string | null;
  movements: BankMovement[];
  invoices: InvoiceXML[];
  matches: ConciliationGroup[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];

  rfcEmpresaActual: string | null;
  hasMixedRfcsError: boolean;

  selectedBankMovementIds: string[];
  selectedInvoiceIds: string[];

  setCurrentStep: (step: ConciliationStep) => void;
  setMovements: (movements: BankMovement[]) => void;
  setInvoices: (invoices: InvoiceXML[]) => void;
  processInvoiceUpload: (
    extraction: ExtractInvoicesXmlResult,
    options?: { append?: boolean },
  ) => InvoiceUploadResult;
  clearMixedRfcsError: () => void;

  runConciliation: () => void;
  addIncrementalInvoices: (newInvoices: InvoiceXML[]) => { addedCount: number };
  removeXMLInvoice: (id: string) => { success: boolean; error?: string };

  toggleBankSelection: (id: string) => void;
  toggleInvoiceSelection: (id: string) => void;
  clearSelection: () => void;
  createMatchGroup: () => { success: boolean; error?: string };
  unmatchGroup: (groupId: string) => void;
  approveGroupDiscrepancy: (groupId: string) => void;

  /** Clasifica un movimiento bancario como excepción (o la remueve) directamente en el estado local.
   *  Usado en la sesión activa antes de persistir en el backend. */
  classifyMovement: (params: {
    movementId: string;
    isException: boolean;
    exceptionType?: ExceptionType;
    notes?: string;
  }) => void;

  /** Restablece el motor local limpiando todos los cruces y excepciones para volver a ejecutar el cruce automático */
  rerunConciliation: () => void;

  reset: () => void;
  loadSnapshot: (snapshot: ConciliationSnapshot) => void;
}

const INITIAL_STATE = {
  currentStep: "BANK_UPLOAD" as ConciliationStep,
  activeConciliationId: null,
  activeConciliationTitle: null,
  movements: [] as BankMovement[],
  invoices: [] as InvoiceXML[],
  matches: [] as ConciliationGroup[],
  remainingInvoices: [] as InvoiceXML[],
  remainingBankMovements: [] as BankMovement[],
  rfcEmpresaActual: null as string | null,
  hasMixedRfcsError: false,
  selectedBankMovementIds: [] as string[],
  selectedInvoiceIds: [] as string[],
};

const MIXED_RFCS_ERROR_MESSAGE =
  "Se detectaron RFCs de distintas empresas en el lote de XMLs. Carga únicamente facturas del mismo contribuyente.";

function normalizeInvoices(invoices: InvoiceXML[]): InvoiceXML[] {
  return invoices.map((inv) => ({
    ...inv,
    matchedMovementIds: inv.matchedMovementIds ?? [],
    status: inv.status ?? (inv.matchedGroupId ? "MATCHED" : "UNMATCHED"),
  }));
}

export const useConciliationStore = create<ConciliationState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setCurrentStep: (step) => set({ currentStep: step }),

      setMovements: (movements) =>
        set({
          movements: movements.map((m) => ({
            ...m,
            matchedInvoiceIds: m.matchedInvoiceIds ?? [],
            status: m.status ?? "UNMATCHED",
          })),
        }),

      setInvoices: (invoices) =>
        set({
          invoices: normalizeInvoices(invoices),
          ...(invoices.length === 0
            ? { rfcEmpresaActual: null, hasMixedRfcsError: false }
            : {}),
        }),

      processInvoiceUpload: (extraction, options = {}) => {
        const { append = false } = options;
        const { invoices: parsedInvoices, rfcEmpresaDetectado, hasMixedRfcs } = extraction;

        if (parsedInvoices.length === 0) {
          return {
            success: false,
            error: "No se encontraron facturas XML válidas o timbradas en la selección.",
          };
        }

        if (hasMixedRfcs) {
          set({ hasMixedRfcsError: true });
          return { success: false, error: MIXED_RFCS_ERROR_MESSAGE };
        }

        const { rfcEmpresaActual, invoices: existingInvoices } = get();

        if (
          append &&
          rfcEmpresaActual &&
          rfcEmpresaDetectado &&
          rfcEmpresaActual !== rfcEmpresaDetectado
        ) {
          set({ hasMixedRfcsError: true });
          return { success: false, error: MIXED_RFCS_ERROR_MESSAGE };
        }

        const normalizedNew = normalizeInvoices(parsedInvoices);

        if (append) {
          const { addedCount } = get().addIncrementalInvoices(normalizedNew);
          set({
            rfcEmpresaActual: rfcEmpresaDetectado ?? rfcEmpresaActual,
            hasMixedRfcsError: false,
          });
          return { success: true, addedCount };
        }

        set({
          invoices: normalizedNew,
          rfcEmpresaActual: rfcEmpresaDetectado,
          hasMixedRfcsError: false,
        });

        return { success: true, addedCount: normalizedNew.length };
      },

      clearMixedRfcsError: () => set({ hasMixedRfcsError: false }),

      runConciliation: () => {
        const { movements, invoices } = get();
        const results = executeReconciliation(movements, invoices);
        const { movements: updatedMovements, invoices: updatedInvoices } =
          applyAutoMatchEntities(
            movements,
            invoices,
            results.matches,
          );

        set({
          matches: results.matches,
          remainingInvoices: results.remainingInvoices,
          remainingBankMovements: results.remainingBankMovements,
          movements: updatedMovements,
          invoices: updatedInvoices,
          selectedBankMovementIds: [],
          selectedInvoiceIds: [],
          currentStep: "RESULTS",
        });
      },

      addIncrementalInvoices: (newInvoices) => {
        const { matches, remainingInvoices, invoices } = get();

        const existingUuids = new Set<string>([
          ...invoices.map((inv) => inv.uuid),
          ...remainingInvoices.map((inv) => inv.uuid),
          ...matches.flatMap((g) =>
            g.invoiceIds
              .map((id) => invoices.find((inv) => inv.id === id)?.uuid)
              .filter((uuid): uuid is string => !!uuid),
          ),
        ]);

        const normalizedNew = newInvoices.map((inv) => ({
          ...inv,
          matchedMovementIds: inv.matchedMovementIds ?? [],
          status: inv.status ?? "UNMATCHED",
        }));

        const uniqueNewInvoices = normalizedNew.filter(
          (inv) => !existingUuids.has(inv.uuid),
        );

        if (uniqueNewInvoices.length > 0) {
          set({
            invoices: [...invoices, ...uniqueNewInvoices],
            remainingInvoices: [...remainingInvoices, ...uniqueNewInvoices],
          });
        }

        return { addedCount: uniqueNewInvoices.length };
      },

      removeXMLInvoice: (id: string) => {
        const { invoices, remainingInvoices, selectedInvoiceIds } = get();
        const invoice = invoices.find((inv) => inv.id === id);

        if (!invoice) {
          return { success: false, error: "La factura no existe." };
        }

        const isMatched =
          invoice.matchedGroupId !== undefined ||
          invoice.matchedMovementIds.length > 0 ||
          invoice.status === "MATCHED" ||
          invoice.status === "PARTIAL";

        if (isMatched) {
          return {
            success: false,
            error: "No se puede eliminar una factura conciliada.",
          };
        }

        set({
          invoices: invoices.filter((inv) => inv.id !== id),
          remainingInvoices: remainingInvoices.filter((inv) => inv.id !== id),
          selectedInvoiceIds: selectedInvoiceIds.filter((x) => x !== id),
        });

        return { success: true };
      },

      toggleBankSelection: (id) => {
        const { selectedBankMovementIds } = get();
        const isSelected = selectedBankMovementIds.includes(id);
        set({
          selectedBankMovementIds: isSelected
            ? selectedBankMovementIds.filter((x) => x !== id)
            : [...selectedBankMovementIds, id],
        });
      },

      toggleInvoiceSelection: (id) => {
        const { selectedInvoiceIds } = get();
        const isSelected = selectedInvoiceIds.includes(id);
        set({
          selectedInvoiceIds: isSelected
            ? selectedInvoiceIds.filter((x) => x !== id)
            : [...selectedInvoiceIds, id],
        });
      },

      clearSelection: () =>
        set({ selectedBankMovementIds: [], selectedInvoiceIds: [] }),

      createMatchGroup: () => {
        const state = get();
        const { selectedBankMovementIds, selectedInvoiceIds } = state;

        if (selectedBankMovementIds.length === 0 || selectedInvoiceIds.length === 0) {
          return {
            success: false,
            error: "Selecciona al menos un movimiento bancario y una factura.",
          };
        }

        const alreadyGrouped = [
          ...selectedBankMovementIds.filter((id) => {
            const m = state.movements.find((mov) => mov.id === id);
            return m?.matchedGroupId !== undefined;
          }),
          ...selectedInvoiceIds.filter((id) => {
            const inv = state.invoices.find((i) => i.id === id);
            return inv?.matchedGroupId !== undefined;
          }),
        ];

        if (alreadyGrouped.length > 0) {
          return {
            success: false,
            error: "Uno o más elementos seleccionados ya pertenecen a un grupo.",
          };
        }

        const group = createConciliationGroup(
          selectedBankMovementIds,
          selectedInvoiceIds,
          state.movements,
          state.invoices,
          "MANUAL",
        );

        const updated = applyGroupToState(state, group);

        set({
          ...updated,
          selectedBankMovementIds: [],
          selectedInvoiceIds: [],
        });

        return { success: true };
      },

      unmatchGroup: (groupId) => {
        const state = get();
        const updated = removeGroupFromState(state, groupId);
        if (!updated) return;

        set({
          ...updated,
          remainingBankMovements: dedupeRemainingBankMovements(
            updated.matches,
            updated.remainingBankMovements,
          ),
        });
      },

      approveGroupDiscrepancy: (groupId) => {
        const state = get();
        set(approveGroupInState(state, groupId));
      },

      classifyMovement: ({ movementId, isException, exceptionType = null, notes = '' }) => {
        const { movements, remainingBankMovements } = get();

        const updatedMovements = movements.map((m) => {
          if (m.id !== movementId) return m;
          return {
            ...m,
            isException,
            exceptionType: isException ? exceptionType : null,
            notes: isException ? notes : '',
            // Si se remueve la excepción, limpiamos el estatus para que vuelva a UNMATCHED
            status: (isException ? m.status : 'UNMATCHED') as BankMovement['status'],
          };
        });

        // Sincronizar remainingBankMovements
        let updatedRemaining = [...remainingBankMovements];
        if (isException) {
          // Al ser excepcionado, sale de los "pendientes" del panel de banco
          updatedRemaining = updatedRemaining.filter((m) => m.id !== movementId);
        } else {
          // Al quitar la excepción, vuelve a remaining si no estaba ya
          const movement = updatedMovements.find((m) => m.id === movementId);
          if (movement && !updatedRemaining.some((m) => m.id === movementId)) {
            updatedRemaining.push(movement);
          }
        }

        set({
          movements: updatedMovements,
          remainingBankMovements: updatedRemaining,
        });
      },

      rerunConciliation: () => {
        const { movements, invoices } = get();

        // 1. Restablecer todos los movimientos a su estado original (no conciliados ni exceptuados)
        const resetMovements = movements.map((m) => ({
          ...m,
          matchedInvoiceIds: [] as string[],
          status: "UNMATCHED" as const,
          matchedGroupId: undefined,
          isException: false,
          exceptionType: null as any,
          notes: "",
          matchedManualWith: [] as string[],
        }));

        // 2. Restablecer todas las facturas a su estado original (no conciliadas)
        const resetInvoices = invoices.map((inv) => ({
          ...inv,
          matchedMovementIds: [] as string[],
          status: "UNMATCHED" as const,
          matchedGroupId: undefined,
        }));

        // 3. Actualizar estado local a valores base
        set({
          movements: resetMovements,
          invoices: resetInvoices,
          matches: [],
          remainingInvoices: resetInvoices,
          remainingBankMovements: resetMovements,
          selectedBankMovementIds: [],
          selectedInvoiceIds: [],
        });

        // 4. Volver a ejecutar el algoritmo de cruce automático
        get().runConciliation();
      },

      reset: () => set({ ...INITIAL_STATE }),

      loadSnapshot: (snapshot) => {
        const cleanRemainingBankMovements = dedupeRemainingBankMovements(
          snapshot.matches,
          snapshot.remainingBankMovements,
        );

        set({
          activeConciliationId: snapshot.id,
          activeConciliationTitle: snapshot.title,
          rfcEmpresaActual: snapshot.rfcEmpresa ?? null,
          hasMixedRfcsError: false,
          currentStep: "RESULTS",
          matches: snapshot.matches,
          movements: snapshot.movements.map((m) => ({
            ...m,
            matchedInvoiceIds: m.matchedInvoiceIds ?? [],
          })),
          invoices: snapshot.invoices.map((inv) => ({
            ...inv,
            matchedMovementIds: inv.matchedMovementIds ?? [],
            status: inv.status ?? (inv.matchedGroupId ? "MATCHED" : "UNMATCHED"),
          })),
          remainingInvoices: snapshot.remainingInvoices,
          remainingBankMovements: cleanRemainingBankMovements,
          selectedBankMovementIds: [],
          selectedInvoiceIds: [],
        });
      },
    }),
    {
      name: "conciliafacil-storage",
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        activeConciliationId: state.activeConciliationId,
        activeConciliationTitle: state.activeConciliationTitle,
        rfcEmpresaActual: state.rfcEmpresaActual,
        movements: state.movements,
        invoices: state.invoices,
        matches: state.matches,
        remainingInvoices: state.remainingInvoices,
        remainingBankMovements: state.remainingBankMovements,
      }),
    },
  ),
);

resetters.add(() => useConciliationStore.getState().reset());

