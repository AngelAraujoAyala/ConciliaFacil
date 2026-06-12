export type MatchStatus = 'MATCHED' | 'PARTIAL' | 'UNMATCHED';
export type MovementType = 'INGRESO' | 'EGRESO';

export interface BankMovement {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: MovementType;
  status: MatchStatus;
  matchedInvoiceId?: string;
}

export interface Invoice {
  id: string;
  folio?: string;
  rfcEmisor: string;
  rfcReceptor: string;
  date: string;
  amount: number;
  filename: string;
}

export interface ConciliationRecord {
  id: string;
  title: string;
  date: string; // Fecha de creación del registro
  movements: BankMovement[];
  invoices: Invoice[];
  stats: {
    totalMovements: number;
    matched: number;
    partial: number;
    unmatched: number;
  };
}