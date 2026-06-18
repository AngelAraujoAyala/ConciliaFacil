import type { BankMovement, InvoiceXML } from "../../../types";
import type { ConciliationMatch } from "../../../types";

/**
 * Calcula la diferencia en días entre dos cadenas de fecha (YYYY-MM-DD)
 */
const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Motor de conciliación inteligente
 * @param movements Lista de movimientos bancarios del Paso 1
 * @param invoices Lista de facturas XML del Paso 2
 * @param daysTolerance Días máximos de diferencia permitidos entre banco y factura (por defecto 4)
 */
export const executeReconciliation = (
  movements: BankMovement[],
  invoices: InvoiceXML[],
  daysTolerance: number = 4,
  amountTolerance: number = 5.0, // Permite hasta $5.00 pesos de diferencia por defecto
) => {
  const matches: ConciliationMatch[] = [];
  let remainingInvoices = [...invoices];

  movements.forEach((movement) => {
    // 1. Buscamos facturas del mismo tipo que entren en la tolerancia de monto
    const potentialMatches = remainingInvoices.filter((invoice) => {
      const amountDiff = Math.abs(invoice.total - movement.amount);
      const sameType = invoice.type === movement.type;
      return amountDiff <= amountTolerance && sameType;
    });

    if (potentialMatches.length === 0) {
      matches.push({
        id: `match-bank-${movement.id}`,
        bankMovement: movement,
        matchedInvoice: null,
        status: "NO_MATCH",
        observations: "No se encontraron facturas cercanas en monto.",
      });
      return;
    }

    // 2. Filtrar por ventana de tiempo
    const matchesWithinTimeWindow = potentialMatches.filter((invoice) => {
      return getDaysDifference(movement.date, invoice.date) <= daysTolerance;
    });

    if (matchesWithinTimeWindow.length === 1) {
      const luckyInvoice = matchesWithinTimeWindow[0];
      const exactAmount = Math.abs(luckyInvoice.total - movement.amount) < 0.01;

      matches.push({
        id: `match-auto-${movement.id}-${luckyInvoice.id}`,
        bankMovement: movement,
        matchedInvoice: luckyInvoice,
        // Si varió en centavos/pesos, lo mandamos a revisión (amarillo)
        status: exactAmount ? "TOTAL_MATCH" : "MULTIPLE_MATCHES",
        observations: exactAmount
          ? undefined
          : "Diferencia menor en el monto total.",
      });

      remainingInvoices = remainingInvoices.filter(
        (inv) => inv.id !== luckyInvoice.id,
      );
    } else if (matchesWithinTimeWindow.length > 1) {
      // Si hay ambigüedad de varias facturas candidatas, sugerimos la de menor diferencia de dinero/fecha
      const bestInvoice = matchesWithinTimeWindow[0]; // Simplificado para el MVP

      matches.push({
        id: `match-ambiguous-${movement.id}-${bestInvoice.id}`,
        bankMovement: movement,
        matchedInvoice: bestInvoice,
        status: "MULTIPLE_MATCHES",
        observations: "Múltiples candidatos o desfase detectado. Ver opciones.",
      });

      remainingInvoices = remainingInvoices.filter(
        (inv) => inv.id !== bestInvoice.id,
      );
    } else {
      // Hay facturas con montos similares pero muy lejos en fecha
      matches.push({
        id: `match-timeout-${movement.id}`,
        bankMovement: movement,
        matchedInvoice: null,
        status: "NO_MATCH",
        observations: "Facturas similares exceden límite de días.",
      });
    }
  });

  return { matches, remainingInvoices };
};
