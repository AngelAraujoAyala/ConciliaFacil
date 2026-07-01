import type {
  BankMovement,
  ConciliationGroup,
  InvoiceXML,
} from "../../../types";

export interface CreateConciliationDto {
  id?: string;
  title: string;
  status: string;
  userId: string;
  successRate: number;
  totalInvoices: number;
  totalBankMovements: number;
  matchedCount: number;
  schemaVersion: 2;
  matches: ConciliationGroup[];
  movements: BankMovement[];
  invoices: InvoiceXML[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];
}
