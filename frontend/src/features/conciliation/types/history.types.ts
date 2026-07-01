import type {
  BankMovement,
  ConciliationGroup,
  InvoiceXML,
} from "../../../types";

export type ConciliationStatus = "DRAFT" | "COMPLETED";

export interface ConciliationSummary {
  id: string;
  title: string;
  status: ConciliationStatus;
  totalInvoices: number;
  totalBankMovements: number;
  matchedCount: number;
  successRate: number;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  movements?: BankMovement[];
}

export interface ConciliationDetail extends ConciliationSummary {
  matches: ConciliationGroup[];
  movements: BankMovement[];
  invoices: InvoiceXML[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];
}
