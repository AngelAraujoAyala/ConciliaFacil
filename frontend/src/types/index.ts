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

// export interface Invoice {
//   id: string;
//   folio?: string;
//   rfcEmisor: string;
//   rfcReceptor: string;
//   date: string;
//   amount: number;
//   filename: string;
// }

export interface InvoiceXML {
  id: string;          // Identificador interno
  uuid: string;        // Folio Fiscal del SAT (36 caracteres)
  date: string;        // Formato YYYY-MM-DD
  total: number;       // Monto total de la factura
  type: 'INGRESO' | 'EGRESO';
  rfcEmisor: string;
  nameEmisor: string;
  rfcReceptor: string;
  nameReceptor: string;
}

export interface ConciliationRecord {
  id: string;
  title: string;
  date: string; // Fecha de creación del registro
  movements: BankMovement[];
  invoices: InvoiceXML[];
  stats: {
    totalMovements: number;
    matched: number;
    partial: number;
    unmatched: number;
  };
}

export interface ConciliationMatch {
  id: string; // ID único para la fila del reporte
  bankMovement: BankMovement;
  matchedInvoice: InvoiceXML | null;
  status: "TOTAL_MATCH" | "NO_MATCH" | "MULTIPLE_MATCHES";
  observations?: string;
}

export interface ReconciliationResult {
  matches: ConciliationMatch[];
  unmatchedInvoices: InvoiceXML[];
  summary: {
    totalBankMovements: number;
    totalInvoices: number;
    fullyConciliated: number;
    unreconciledBank: number;
    unreconciledInvoices: number;
  };
}