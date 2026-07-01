import type { BankMovement, ConciliationGroupStatus, InvoiceXML } from "../../../types";

export const DEFAULT_AMOUNT_TOLERANCE = 0.01;

export interface AmountSummary {
  bankTotal: number;
  invoiceTotal: number;
  delta: number;
  isWithinTolerance: boolean;
}

export function sumBankAmounts(movements: BankMovement[]): number {
  return movements.reduce((acc, m) => acc + m.amount, 0);
}

export function sumInvoiceTotals(invoices: InvoiceXML[]): number {
  return invoices.reduce((acc, inv) => acc + inv.total, 0);
}

export function computeAmountSummary(
  movements: BankMovement[],
  invoices: InvoiceXML[],
  tolerance: number = DEFAULT_AMOUNT_TOLERANCE,
): AmountSummary {
  const bankTotal = sumBankAmounts(movements);
  const invoiceTotal = sumInvoiceTotals(invoices);
  const delta = bankTotal - invoiceTotal;

  return {
    bankTotal,
    invoiceTotal,
    delta,
    isWithinTolerance: Math.abs(delta) <= tolerance,
  };
}

export function resolveGroupStatus(
  summary: AmountSummary,
  approved = false,
): ConciliationGroupStatus {
  if (approved) return "MANUAL_MATCH";
  if (summary.isWithinTolerance) return "TOTAL_MATCH";
  return "PARTIAL_MATCH";
}
