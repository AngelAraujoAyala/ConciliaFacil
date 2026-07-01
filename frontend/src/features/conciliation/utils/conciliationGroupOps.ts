import type {
  BankMovement,
  ConciliationGroup,
  ConciliationGroupSource,
  InvoiceXML,
  MatchStatus,
} from "../../../types";
import {
  computeAmountSummary,
  resolveGroupStatus,
} from "./conciliationAmountUtils";

export interface ConciliationStateSlice {
  matches: ConciliationGroup[];
  movements: BankMovement[];
  invoices: InvoiceXML[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];
}

export function createConciliationGroup(
  bankMovementIds: string[],
  invoiceIds: string[],
  movements: BankMovement[],
  invoices: InvoiceXML[],
  source: ConciliationGroupSource,
  approved = false,
): ConciliationGroup {
  const selectedMovements = movements.filter((m) =>
    bankMovementIds.includes(m.id),
  );
  const selectedInvoices = invoices.filter((inv) => invoiceIds.includes(inv.id));
  const summary = computeAmountSummary(selectedMovements, selectedInvoices);

  return {
    id: crypto.randomUUID(),
    bankMovementIds,
    invoiceIds,
    status: resolveGroupStatus(summary, approved),
    source,
    bankTotal: summary.bankTotal,
    invoiceTotal: summary.invoiceTotal,
    amountDelta: summary.delta,
    createdAt: new Date().toISOString(),
    observations:
      source === "MANUAL" && !summary.isWithinTolerance
        ? "Match manual con diferencia de montos."
        : undefined,
  };
}

export function applyGroupToState(
  state: ConciliationStateSlice,
  group: ConciliationGroup,
): ConciliationStateSlice {
  const invoiceIdSet = new Set(group.invoiceIds);
  const movementIdSet = new Set(group.bankMovementIds);
  const entityStatus = group.status === "PARTIAL_MATCH" ? "PARTIAL" : "MATCHED";

  const updatedMovements = state.movements.map((m) => {
    if (!movementIdSet.has(m.id)) return m;
    return {
      ...m,
      matchedGroupId: group.id,
      matchedInvoiceIds: group.invoiceIds,
      status: entityStatus as BankMovement["status"],
    };
  });

  const updatedInvoices = state.invoices.map((inv) => {
    if (!invoiceIdSet.has(inv.id)) return inv;
    return {
      ...inv,
      matchedGroupId: group.id,
      matchedMovementIds: group.bankMovementIds,
      status: entityStatus as MatchStatus,
    };
  });

  return {
    matches: [...state.matches, group],
    movements: updatedMovements,
    invoices: updatedInvoices,
    remainingInvoices: state.remainingInvoices.filter(
      (inv) => !invoiceIdSet.has(inv.id),
    ),
    remainingBankMovements: state.remainingBankMovements.filter(
      (m) => !movementIdSet.has(m.id),
    ),
  };
}

export function removeGroupFromState(
  state: ConciliationStateSlice,
  groupId: string,
): ConciliationStateSlice | null {
  const group = state.matches.find((g) => g.id === groupId);
  if (!group) return null;

  const invoiceIdSet = new Set(group.invoiceIds);
  const movementIdSet = new Set(group.bankMovementIds);

  const releasedMovements = state.movements
    .filter((m) => movementIdSet.has(m.id))
    .map((m) => ({
      ...m,
      matchedGroupId: undefined,
      matchedInvoiceIds: [],
      status: "UNMATCHED" as const,
    }));

  const releasedInvoices = state.invoices
    .filter((inv) => invoiceIdSet.has(inv.id))
    .map((inv) => ({
      ...inv,
      matchedGroupId: undefined,
      matchedMovementIds: [],
      status: "UNMATCHED" as MatchStatus,
    }));

  const updatedMovements = state.movements.map((m) => {
    if (!movementIdSet.has(m.id)) return m;
    return {
      ...m,
      matchedGroupId: undefined,
      matchedInvoiceIds: [],
      status: "UNMATCHED" as const,
    };
  });

  const updatedInvoices = state.invoices.map((inv) => {
    if (!invoiceIdSet.has(inv.id)) return inv;
    return {
      ...inv,
      matchedGroupId: undefined,
      matchedMovementIds: [],
      status: "UNMATCHED" as MatchStatus,
    };
  });

  return {
    matches: state.matches.filter((g) => g.id !== groupId),
    movements: updatedMovements,
    invoices: updatedInvoices,
    remainingInvoices: [...state.remainingInvoices, ...releasedInvoices],
    remainingBankMovements: [
      ...state.remainingBankMovements,
      ...releasedMovements,
    ],
  };
}

export function approveGroupInState(
  state: ConciliationStateSlice,
  groupId: string,
): ConciliationStateSlice {
  const diffLabel = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(
    state.matches.find((g) => g.id === groupId)?.amountDelta ?? 0,
  );

  return {
    ...state,
    matches: state.matches.map((g) =>
      g.id === groupId
        ? {
            ...g,
            status: "MANUAL_MATCH" as const,
            observations: `Desfase de ${diffLabel} aprobado manualmente.`,
          }
        : g,
    ),
    movements: state.movements.map((m) =>
      m.matchedGroupId === groupId ? { ...m, status: "MATCHED" as const } : m,
    ),
  };
}
