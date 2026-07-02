import type { BankMovement, ConciliationGroup, InvoiceXML } from "../../../types";

export function getConciliatedGroups(
  matches: ConciliationGroup[],
): ConciliationGroup[] {
  return matches.filter((g) => g.status !== "PENDING");
}

export function getMatchedBankMovementIds(
  matches: ConciliationGroup[],
): Set<string> {
  const ids = new Set<string>();
  matches.forEach((g) => g.bankMovementIds.forEach((id) => ids.add(id)));
  return ids;
}

export function getMatchedInvoiceIds(matches: ConciliationGroup[]): Set<string> {
  const ids = new Set<string>();
  matches.forEach((g) => g.invoiceIds.forEach((id) => ids.add(id)));
  return ids;
}

export function countUniqueBankMovements(
  movements: BankMovement[],
): number {
  return new Set(movements.map((m) => m.id)).size;
}

export function countUniqueInvoices(
  invoices: InvoiceXML[],
): number {
  return new Set(invoices.map((inv) => inv.id)).size;
}

export function dedupeRemainingBankMovements(
  matches: ConciliationGroup[],
  remainingBankMovements: BankMovement[],
): BankMovement[] {
  const matchedIds = getMatchedBankMovementIds(matches);
  const seen = new Set<string>();

  return remainingBankMovements.filter((m) => {
    if (matchedIds.has(m.id)) return false;
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function countFullyConciliatedMovements(
  matches: ConciliationGroup[],
): number {
  const ids = new Set<string>();
  matches
    .filter((g) => g.status === "TOTAL_MATCH" || g.status === "MANUAL_MATCH")
    .forEach((g) => g.bankMovementIds.forEach((id) => ids.add(id)));
  return ids.size;
}

export function computeSuccessRate(
  matches: ConciliationGroup[],
  totalBankMovements: number,
  movements?: BankMovement[],
): number {
  if (totalBankMovements === 0) return 0;
  const conciliatedIds = new Set<string>();
  matches
    .filter((g) => g.status === "TOTAL_MATCH" || g.status === "MANUAL_MATCH")
    .forEach((g) => g.bankMovementIds.forEach((id) => conciliatedIds.add(id)));

  // Excepciones (TRASPASO, RETIRO_EFECTIVO, COMISION_GLOBAL) también cuentan como resueltas
  const exceptionCount = movements
    ? movements.filter((m) => m.isException && m.exceptionType !== "MANUAL_MATCH").length
    : 0;

  const resolvedCount = conciliatedIds.size + exceptionCount;
  return Math.round((resolvedCount / totalBankMovements) * 100);
}

/** Separa los movimientos en sus tres categorías para filtrado en la UI */
export function classifyMovements(
  movements: BankMovement[],
  matches: ConciliationGroup[],
) {
  const conciliatedIds = new Set<string>();
  matches
    .filter((g) => g.status === "TOTAL_MATCH" || g.status === "MANUAL_MATCH")
    .forEach((g) => g.bankMovementIds.forEach((id) => conciliatedIds.add(id)));

  const pendingReal: BankMovement[] = [];
  const exceptions: BankMovement[] = [];
  const conciliated: BankMovement[] = [];

  for (const m of movements) {
    if (conciliatedIds.has(m.id)) {
      conciliated.push(m);
    } else if (m.isException) {
      exceptions.push(m);
    } else {
      pendingReal.push(m);
    }
  }

  return { pendingReal, exceptions, conciliated };
}
