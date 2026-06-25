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
  amountTolerance: number = 5.0,
) => {
  const matches: ConciliationMatch[] = [];
  let remainingInvoices = [...invoices];
  // 1. Inicializamos el contenedor de movimientos huérfanos
  const remainingBankMovements: BankMovement[] = [];

  movements.forEach((movement) => {
    const potentialMatches = remainingInvoices.filter((invoice) => {
      const amountDiff = Math.abs(invoice.total - movement.amount);
      const sameType = invoice.type === movement.type;
      return amountDiff <= amountTolerance && sameType;
    });

    if (potentialMatches.length === 0) {
      // Mantenemos esto si tu tabla de resultados necesita renderizar la fila vacía
      matches.push({
        id: `match-bank-${movement.id}`,
        bankMovement: movement,
        matchedInvoice: null,
        status: "NO_MATCH",
        observations: "No se encontraron facturas cercanas en monto.",
      });

      // 2. 🎯 GUARDAMOS EL MOVIMIENTO HUÉRFANO REAL
      remainingBankMovements.push(movement);
      return;
    }

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
        status: exactAmount ? "TOTAL_MATCH" : "MULTIPLE_MATCHES",
        observations: exactAmount
          ? undefined
          : "Diferencia menor en el monto total.",
      });

      remainingInvoices = remainingInvoices.filter(
        (inv) => inv.id !== luckyInvoice.id,
      );
    } else if (matchesWithinTimeWindow.length > 1) {
      const bestInvoice = matchesWithinTimeWindow[0];

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
      matches.push({
        id: `match-timeout-${movement.id}`,
        bankMovement: movement,
        matchedInvoice: null,
        status: "NO_MATCH",
        observations: "Facturas similares exceden límite de días.",
      });

      // 3. 🎯 TAMBIÉN ES HUÉRFANO POR VENTANA DE TIEMPO
      remainingBankMovements.push(movement);
    }
  });

  // 4. Regresamos las 3 colecciones perfectamente calculadas
  return { matches, remainingInvoices, remainingBankMovements };
};
