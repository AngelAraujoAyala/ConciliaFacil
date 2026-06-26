import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ConciliationSummary } from "../../conciliation/types/history.types";

interface HistoryTableProps {
  history: ConciliationSummary[] | undefined;
  selectedId: string | null;
  onSelectRow: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  selectedId,
  onSelectRow,
}) => {
  const getSuccessRateColor = (rate: number) => {
    if (rate === 100)
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (rate >= 70) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <th className="px-6 py-4">Ejercicio / Título</th>
              <th className="px-6 py-4">Fecha de Cierre</th>
              <th className="px-6 py-4 text-center">Efectividad</th>
              <th className="px-6 py-4 text-right">Métricas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {history?.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  No has guardado ninguna sesión de conciliación todavía.
                </td>
              </tr>
            ) : (
              history?.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectRow(item.id)}
                  className={`cursor-pointer transition-all duration-150 hover:bg-indigo-50/40 ${
                    selectedId === item.id
                      ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span>{item.title}</span>
                      {item.status === "DRAFT" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          Borrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Completada
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {format(
                      new Date(item.createdAt),
                      "dd 'de' MMM, yyyy HH:mm",
                      { locale: es },
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSuccessRateColor(item.successRate)}`}
                    >
                      {item.successRate}% Conciliado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 whitespace-nowrap">
                    <div className="text-xs text-slate-500">
                      <span className="text-emerald-600 font-bold">
                        {item.matchedCount}
                      </span>{" "}
                      Cruces
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.totalInvoices} XMLs / {item.totalBankMovements} Movs
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
