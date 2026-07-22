import { useMemo } from "react";
import type { BankMovement, InvoiceXML } from "../../../types";
import { useConciliationStore } from "../../../store/useConciliationStore";
import { computeAmountSummary } from "../utils/conciliationAmountUtils";
import { Trash2 } from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    amount,
  );

export default function ManualMatchPanel() {
  const {
    remainingBankMovements,
    remainingInvoices,
    movements,
    invoices,
    selectedBankMovementIds,
    selectedInvoiceIds,
    toggleBankSelection,
    toggleInvoiceSelection,
    clearSelection,
    createMatchGroup,
  } = useConciliationStore();

  const selectedMovements = useMemo(
    () => movements.filter((m) => selectedBankMovementIds.includes(m.id)),
    [movements, selectedBankMovementIds],
  );

  const selectedInvoicesList = useMemo(
    () => invoices.filter((inv) => selectedInvoiceIds.includes(inv.id)),
    [invoices, selectedInvoiceIds],
  );

  const amountSummary = useMemo(
    () => computeAmountSummary(selectedMovements, selectedInvoicesList),
    [selectedMovements, selectedInvoicesList],
  );

  const canMatch =
    selectedBankMovementIds.length > 0 && selectedInvoiceIds.length > 0;

  const handleCreateMatch = () => {
    const result = createMatchGroup();
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  if (
    remainingBankMovements.length === 0 &&
    remainingInvoices.length === 0
  ) {
    return (
      <div className="p-8 text-center text-sm text-gray-400 dark:text-slate-500">
        No hay elementos pendientes por conciliar manualmente.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100">
            Conciliación manual múltiple
          </h3>
          <p className="text-xs text-gray-400 dark:text-slate-400">
            Selecciona movimientos bancarios y facturas, luego confirma el
            cruce.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(selectedBankMovementIds.length > 0 ||
            selectedInvoiceIds.length > 0) && (
            <button
              onClick={clearSelection}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Limpiar selección
            </button>
          )}
          <button
            onClick={handleCreateMatch}
            disabled={!canMatch}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Conciliar selección
          </button>
        </div>
      </div>

      {canMatch && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            amountSummary.isWithinTolerance
              ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300"
              : "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300"
          }`}
        >
          Banco: {formatCurrency(amountSummary.bankTotal)} · Facturas:{" "}
          {formatCurrency(amountSummary.invoiceTotal)} · Diferencia:{" "}
          {formatCurrency(amountSummary.delta)}
          {!amountSummary.isWithinTolerance &&
            " — Podrás aprobar el desfase después del cruce."}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SelectableBankPanel
          items={remainingBankMovements}
          selectedIds={selectedBankMovementIds}
          onToggle={toggleBankSelection}
        />
        <SelectableInvoicePanel
          items={remainingInvoices}
          selectedIds={selectedInvoiceIds}
          onToggle={toggleInvoiceSelection}
        />
      </div>
    </div>
  );
}

function SelectableBankPanel({
  items,
  selectedIds,
  onToggle,
}: {
  items: BankMovement[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="bg-gray-50 dark:bg-slate-800/80 px-4 py-2.5 text-[11px] font-bold uppercase text-gray-400 dark:text-slate-400">
        🏦 Movimientos bancarios ({items.length})
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/60">
        {items.length === 0 ? (
          <p className="p-4 text-xs text-gray-400 dark:text-slate-500 text-center">
            Sin movimientos huérfanos.
          </p>
        ) : (
          items.map((m) => (
            <label
              key={m.id}
              className="flex items-start gap-3 p-3 hover:bg-blue-50/30 dark:hover:bg-slate-800/20 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(m.id)}
                onChange={() => onToggle(m.id)}
                className="mt-0.5 rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500">
                    {m.date}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${m.type === "INGRESO" ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30" : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30"}`}
                  >
                    {m.type}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">
                  {m.description}
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-slate-100">
                  {formatCurrency(m.amount)}
                </p>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function SelectableInvoicePanel({
  items,
  selectedIds,
  onToggle,
}: {
  items: InvoiceXML[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const removeXMLInvoice = useConciliationStore((state) => state.removeXMLInvoice);

  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="bg-gray-50 dark:bg-slate-800/80 px-4 py-2.5 text-[11px] font-bold uppercase text-gray-400 dark:text-slate-400">
        📁 Facturas XML ({items.length})
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/60">
        {items.length === 0 ? (
          <p className="p-4 text-xs text-gray-400 dark:text-slate-500 text-center">
            Sin facturas huérfanas.
          </p>
        ) : (
          items.map((inv) => (
            <label
              key={inv.id}
              className="relative flex items-start gap-3 p-3 hover:bg-purple-50/30 dark:hover:bg-slate-800/20 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(inv.id)}
                onChange={() => onToggle(inv.id)}
                className="mt-0.5 rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900"
              />
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500">
                    {inv.date}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${inv.type === "INGRESO" ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30" : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30"}`}
                  >
                    {inv.type}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">
                  {inv.type === "INGRESO" ? inv.nameReceptor : inv.nameEmisor}
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-slate-100">
                  {formatCurrency(inv.total)}
                </p>
                <p className="text-[10px] font-mono text-gray-400 dark:text-slate-500">
                  ...{inv.uuid.substring(24)}
                </p>
              </div>
              {inv.status === "UNMATCHED" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (confirm('¿Deseas remover esta factura del pool activo?')) {
                      const res = removeXMLInvoice(inv.id);
                      if (!res.success && res.error) alert(res.error);
                    }
                  }}
                  className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar factura"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </label>
          ))
        )}
      </div>
    </div>
  );
}
