import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import { executeReconciliation } from "../features/conciliation/utils/reconciliationEngine";
import type { BankMovement, InvoiceXML, ConciliationMatch } from "../types";

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

interface ConciliationState {
  // Estado
  currentStep: ConciliationStep;
  movements: BankMovement[];
  invoices: InvoiceXML[];
  matches: ConciliationMatch[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];

  // Acciones de Flujo Basico
  setCurrentStep: (step: ConciliationStep) => void;
  setMovements: (movements: BankMovement[]) => void;
  setInvoices: (invoices: InvoiceXML[]) => void;

  // Acciones Nucleares del Motor
  runConciliation: () => void;
  addIncrementalInvoices: (newInvoices: InvoiceXML[]) => { addedCount: number };
  reset: () => void;
  loadSnapshot: (snapshot: {
    matches: ConciliationMatch[];
    remainingInvoices: InvoiceXML[];
    remainingBankMovements: BankMovement[];
  }) => void;
}

export const useConciliationStore = create<ConciliationState>()(
  persist(
    (set, get) => ({
      // --- ESTADO INICIAL ---
      currentStep: "BANK_UPLOAD",
      movements: [],
      invoices: [],
      matches: [],
      remainingInvoices: [],
      remainingBankMovements: [],
      
      // --- ACCIONES DE FLUJO ---
      setCurrentStep: (step) => set({ currentStep: step }),

      setMovements: (movements) => set({ movements }),

      setInvoices: (invoices) => set({ invoices }),

      // --- ACCION: EJECUTAR MOTOR ---
      runConciliation: () => {
        const { movements, invoices } = get();

        // Disparamos tu motor puro
        const results = executeReconciliation(movements, invoices);

        set({
          matches: results.matches,
          remainingInvoices: results.remainingInvoices,
          // 2. Capturamos los movimientos huerfanos que tu motor ya calcula
          // (Asumiendo que tu motor devuelve 'remainingBankMovements' o similar, adáptalo si se llama distinto)
          remainingBankMovements: results.remainingBankMovements || [], 
          currentStep: "RESULTS",
        });
      },

      // --- ACCION: CARGA INCREMENTAL (BLINDADA) ---
      addIncrementalInvoices: (newInvoices) => {
        const { matches, remainingInvoices, invoices } = get();

        // 1. Crear un set de todos los UUIDs que ya existen en el sistema para busqueda O(1)
        const existingUuids = new Set<string>([
          ...invoices.map((inv) => inv.uuid),
          ...remainingInvoices.map((inv) => inv.uuid),
          ...matches
            .map((m) => {
              // Mapeo defensivo: extraemos el UUID de la factura singular del match
              const matchWithInvoice = m as { invoice?: { uuid: string } };
              return matchWithInvoice.invoice?.uuid;
            })
            .filter((uuid): uuid is string => !!uuid),
        ]);

        // 2. Filtrar unicamente los XMLs verdaderamente nuevos
        const uniqueNewInvoices = newInvoices.filter(
          (inv) => !existingUuids.has(inv.uuid),
        );

        if (uniqueNewInvoices.length > 0) {
          set({
            // Los agregamos al pool global de control
            invoices: [...invoices, ...uniqueNewInvoices],
            // Los inyectamos a las facturas huerfanas disponibles para conciliar
            remainingInvoices: [...remainingInvoices, ...uniqueNewInvoices],
          });
        }

        return { addedCount: uniqueNewInvoices.length };
      },

      // --- ACCION: LIMPIAR TODO ---
      reset: () => {
        set({
          currentStep: "BANK_UPLOAD",
          movements: [],
          invoices: [],
          matches: [],
          remainingInvoices: [],
          remainingBankMovements: [],
        });
      },

      // --- ACCION: REANUDAR DESDE SNAPSHOT ---
      loadSnapshot: (snapshot) => {
        const uniqueMovements = new Map<string, BankMovement>();
        snapshot.matches.forEach((m) => {
          if (m.bankMovement) {
            uniqueMovements.set(m.bankMovement.id, m.bankMovement);
          }
        });
        snapshot.remainingBankMovements.forEach((m) => {
          uniqueMovements.set(m.id, m);
        });

        const uniqueInvoices = new Map<string, InvoiceXML>();
        snapshot.matches.forEach((m) => {
          if (m.matchedInvoice) {
            uniqueInvoices.set(m.matchedInvoice.id, m.matchedInvoice);
          }
        });
        snapshot.remainingInvoices.forEach((inv) => {
          uniqueInvoices.set(inv.id, inv);
        });

        set({
          currentStep: "RESULTS",
          matches: snapshot.matches,
          remainingInvoices: snapshot.remainingInvoices,
          remainingBankMovements: snapshot.remainingBankMovements,
          movements: Array.from(uniqueMovements.values()),
          invoices: Array.from(uniqueInvoices.values()),
        });
      },
    }),
    {
      name: "conciliafacil-storage", // Llave unica en IndexedDB
      storage: createJSONStorage(() => indexedDBStorage), // Motor asincrono ilimitado
    },
  ),
);
