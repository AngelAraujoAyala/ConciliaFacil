import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BankMovement, Invoice, ConciliationRecord } from '../types';

interface ConciliationState {
  // Estado actual de la app
  currentMovements: BankMovement[];
  currentInvoices: Invoice[];
  isProcessing: boolean;
  
  // Historial en navegador
  history: ConciliationRecord[];
  
  // Acciones
  setCurrentData: (movements: BankMovement[], invoices: Invoice[]) => void;
  setProcessing: (processing: boolean) => void;
  saveToHistory: (title: string, stats: ConciliationRecord['stats']) => void;
  clearCurrent: () => void;
  deleteHistoryItem: (id: string) => void;
}

export const useConciliationStore = create<ConciliationState>()(
  persist(
    (set, get) => ({
      currentMovements: [],
      currentInvoices: [],
      isProcessing: false,
      history: [],

      setCurrentData: (movements, invoices) => 
        set({ currentMovements: movements, currentInvoices: invoices }),

      setProcessing: (processing) => 
        set({ isProcessing: processing }),

      saveToHistory: (title, stats) => {
        const { currentMovements, currentInvoices, history } = get();
        
        const newRecord: ConciliationRecord = {
          id: crypto.randomUUID(),
          title,
          date: new Date().toISOString(),
          movements: currentMovements,
          invoices: currentInvoices,
          stats
        };

        // Estrategia preventiva: Mantener máximo 15 conciliaciones pesadas en LocalStorage
        const updatedHistory = [newRecord, ...history];
        if (updatedHistory.length > 15) {
          updatedHistory.pop(); // Sacamos el más viejo (FIFO)
        }

        set({ history: updatedHistory });
      },

      clearCurrent: () => 
        set({ currentMovements: [], currentInvoices: [] }),

      deleteHistoryItem: (id) => 
        set((state) => ({
          history: state.history.filter((item) => item.id !== id)
        })),
    }),
    {
      name: 'concilia-facil-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos el historial. Los datos actuales se pierden al cerrar la pestaña si así se desea,
      // o puedes persistirlos quitando el partialize.
      partialize: (state) => ({ history: state.history }),
    }
  )
);