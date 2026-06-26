import type { BankMovement, ConciliationMatch } from "../../../types";

/** Cruces con factura vinculada (excluye filas NO_MATCH del motor). */
export function getRealMatches(matches: ConciliationMatch[]): ConciliationMatch[] {
  return matches.filter(
    (m) => m.status !== "NO_MATCH" && m.matchedInvoice !== null,
  );
}

/**
 * IDs de movimientos bancarios ya emparejados exitosamente.
 * Un movimiento en este set no debe figurar en remainingBankMovements.
 */
export function getMatchedBankMovementIds(
  matches: ConciliationMatch[],
): Set<string> {
  return new Set(getRealMatches(matches).map((m) => m.bankMovement.id));
}

/**
 * Total inmutable de movimientos bancarios únicos.
 * Unión estricta por ID entre filas de matches y remainingBankMovements.
 */
export function countUniqueBankMovements(
  matches: ConciliationMatch[],
  remainingBankMovements: BankMovement[],
): number {
  const ids = new Set<string>();
  matches.forEach((m) => ids.add(m.bankMovement.id));
  remainingBankMovements.forEach((m) => ids.add(m.id));
  return ids.size;
}

/**
 * remainingBankMovements sin duplicados ni movimientos ya emparejados en matches.
 * Evita inflar el contador cuando un NO_MATCH pasa a MANUAL_MATCH/TOTAL_MATCH.
 */
export function dedupeRemainingBankMovements(
  matches: ConciliationMatch[],
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
