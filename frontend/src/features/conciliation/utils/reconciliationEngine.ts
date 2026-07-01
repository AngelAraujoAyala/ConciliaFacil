import type { BankMovement, InvoiceXML, ConciliationGroup } from "../../../types";
import {
  computeAmountSummary,
  resolveGroupStatus,
} from "./conciliationAmountUtils";

const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const executeReconciliation = (
  movements: BankMovement[],
  invoices: InvoiceXML[],
  daysTolerance: number = 4,
  amountTolerance: number = 5.0,
): {
  matches: ConciliationGroup[];
  remainingInvoices: InvoiceXML[];
  remainingBankMovements: BankMovement[];
} => {
  const matches: ConciliationGroup[] = [];
  let remainingInvoices = [...invoices];
  const remainingBankMovements: BankMovement[] = [];

  movements.forEach((movement) => {
    const potentialMatches = remainingInvoices.filter((invoice) => {
      const amountDiff = Math.abs(invoice.total - movement.amount);
      const sameType = invoice.type === movement.type;
      return amountDiff <= amountTolerance && sameType;
    });

    if (potentialMatches.length === 0) {
      remainingBankMovements.push(movement);
      return;
    }

    const matchesWithinTimeWindow = potentialMatches.filter(
      (invoice) =>
        getDaysDifference(movement.date, invoice.date) <= daysTolerance,
    );

    if (matchesWithinTimeWindow.length === 1) {
      const luckyInvoice = matchesWithinTimeWindow[0];
      const summary = computeAmountSummary([movement], [luckyInvoice]);

      matches.push({
        id: crypto.randomUUID(),
        bankMovementIds: [movement.id],
        invoiceIds: [luckyInvoice.id],
        status: resolveGroupStatus(summary),
        source: "AUTO",
        bankTotal: summary.bankTotal,
        invoiceTotal: summary.invoiceTotal,
        amountDelta: summary.delta,
        createdAt: new Date().toISOString(),
        observations: summary.isWithinTolerance
          ? undefined
          : "Diferencia menor en el monto total.",
      });

      remainingInvoices = remainingInvoices.filter(
        (inv) => inv.id !== luckyInvoice.id,
      );
    } else if (matchesWithinTimeWindow.length > 1) {
      const bestInvoice = matchesWithinTimeWindow[0];
      const summary = computeAmountSummary([movement], [bestInvoice]);

      matches.push({
        id: crypto.randomUUID(),
        bankMovementIds: [movement.id],
        invoiceIds: [bestInvoice.id],
        status: "PARTIAL_MATCH",
        source: "AUTO",
        bankTotal: summary.bankTotal,
        invoiceTotal: summary.invoiceTotal,
        amountDelta: summary.delta,
        createdAt: new Date().toISOString(),
        observations:
          "Múltiples candidatos o desfase detectado. Revisar manualmente.",
      });

      remainingInvoices = remainingInvoices.filter(
        (inv) => inv.id !== bestInvoice.id,
      );
    } else {
      remainingBankMovements.push(movement);
    }
  });

  return { matches, remainingInvoices, remainingBankMovements };
};

/** Aplica los grupos auto-generados sobre las entidades en memoria. */
export function applyAutoMatchEntities(
  movements: BankMovement[],
  invoices: InvoiceXML[],
  matches: ConciliationGroup[],
): {
  movements: BankMovement[];
  invoices: InvoiceXML[];
} {
  const updatedMovements = movements.map((m) => {
    const group = matches.find((g) => g.bankMovementIds.includes(m.id));
    if (!group) return m;
    return {
      ...m,
      matchedGroupId: group.id,
      matchedInvoiceIds: group.invoiceIds,
      status:
        group.status === "PARTIAL_MATCH"
          ? ("PARTIAL" as const)
          : ("MATCHED" as const),
    };
  });

  const updatedInvoices = invoices.map((inv) => {
    const group = matches.find((g) => g.invoiceIds.includes(inv.id));
    if (!group) return inv;
    return {
      ...inv,
      matchedGroupId: group.id,
      matchedMovementIds: group.bankMovementIds,
      status:
        group.status === "PARTIAL_MATCH"
          ? ("PARTIAL" as const)
          : ("MATCHED" as const),
    };
  });

  return { movements: updatedMovements, invoices: updatedInvoices };
}

