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
import type { BankMovement, InvoiceXML, ConciliationGroup } from "../types";

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
  matches: ConciliationGroup[];
  movements: BankMovement[];
  invoices: InvoiceXML[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];
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

  selectedBankMovementIds: string[];
  selectedInvoiceIds: string[];

  setCurrentStep: (step: ConciliationStep) => void;
  setMovements: (movements: BankMovement[]) => void;
  setInvoices: (invoices: InvoiceXML[]) => void;

  runConciliation: () => void;
  addIncrementalInvoices: (newInvoices: InvoiceXML[]) => { addedCount: number };
  removeXMLInvoice: (id: string) => { success: boolean; error?: string };

  toggleBankSelection: (id: string) => void;
  toggleInvoiceSelection: (id: string) => void;
  clearSelection: () => void;
  createMatchGroup: () => { success: boolean; error?: string };
  unmatchGroup: (groupId: string) => void;
  approveGroupDiscrepancy: (groupId: string) => void;

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
  selectedBankMovementIds: [] as string[],
  selectedInvoiceIds: [] as string[],
};

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
          invoices: invoices.map((inv) => ({
            ...inv,
            matchedMovementIds: inv.matchedMovementIds ?? [],
            status: inv.status ?? (inv.matchedGroupId ? "MATCHED" : "UNMATCHED"),
          })),
        }),

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

      reset: () => set({ ...INITIAL_STATE }),

      loadSnapshot: (snapshot) => {
        const cleanRemainingBankMovements = dedupeRemainingBankMovements(
          snapshot.matches,
          snapshot.remainingBankMovements,
        );

        set({
          activeConciliationId: snapshot.id,
          activeConciliationTitle: snapshot.title,
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

