import type { ConciliationMatch, InvoiceXML, BankMovement, } from "../../../types";

export type ConciliationStatus = "DRAFT" | "COMPLETED";

// Estructura ligera para listados
export interface ConciliationSummary {
  id: string;
  title: string;
  status: ConciliationStatus;
  totalInvoices: number;
  totalBankMovements: number;
  matchedCount: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

// Estructura completa para auditorías extendidas
export interface ConciliationDetail extends ConciliationSummary {
  matches: ConciliationMatch[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];
}
