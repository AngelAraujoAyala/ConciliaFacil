// ── Plan & Empresa ────────────────────────────────────────────────────────────
export type UserPlan = "FREE" | "BASIC" | "PRO";

export interface Empresa {
  id: string;
  rfc: string;
  razonSocial: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ── Conciliación ──────────────────────────────────────────────────────────────
export type MatchStatus = "MATCHED" | "PARTIAL" | "UNMATCHED";
export type MovementType = "INGRESO" | "EGRESO";

/** Tipos canónicos de excepción para movimientos sin factura directa */
export type ExceptionType =
  | "TRASPASO"
  | "RETIRO_EFECTIVO"
  | "COMISION_GLOBAL"
  | "MANUAL_MATCH"
  | null;

export interface BankMovement {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: MovementType;
  status: MatchStatus;
  matchedInvoiceIds: string[];
  matchedGroupId?: string;
  // --- Campos del sistema de Excepciones y Clasificación Manual ---
  isException?: boolean;
  exceptionType?: ExceptionType;
  notes?: string;
  matchedManualWith?: string[];
}

export interface InvoiceXML {
  id: string;
  uuid: string;
  date: string;
  total: number;
  type: "INGRESO" | "EGRESO";
  isComplemento?: boolean;
  rfcEmisor: string;
  nameEmisor: string;
  rfcReceptor: string;
  nameReceptor: string;
  matchedMovementIds: string[];
  matchedGroupId?: string;
  status?: MatchStatus;
}

export type ConciliationGroupStatus =
  | "TOTAL_MATCH"
  | "PARTIAL_MATCH"
  | "MANUAL_MATCH"
  | "PENDING";

export type ConciliationGroupSource = "AUTO" | "MANUAL";

/** Grupo M:N canónico — se persiste en el campo JSONB `matches`. */
export interface ConciliationGroup {
  id: string;
  bankMovementIds: string[];
  invoiceIds: string[];
  status: ConciliationGroupStatus;
  source: ConciliationGroupSource;
  observations?: string;
  bankTotal: number;
  invoiceTotal: number;
  amountDelta: number;
  createdAt: string;
}

export interface ConciliationRecord {
  id: string;
  title: string;
  date: string;
  movements: BankMovement[];
  invoices: InvoiceXML[];
  stats: {
    totalMovements: number;
    matched: number;
    partial: number;
    unmatched: number;
  };
}

export interface ReconciliationResult {
  matches: ConciliationGroup[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];
  summary: {
    totalBankMovements: number;
    totalInvoices: number;
    fullyConciliated: number;
    unreconciledBank: number;
    unreconciledInvoices: number;
  };
}