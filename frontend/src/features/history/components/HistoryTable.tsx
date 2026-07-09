import React from "react";
import { formatDateTimeInTimezone } from "../../../utils/dateTime";
import { useUserTimezone } from "../../../hooks/useUserTimezone";
import { getSuccessRateBadgeClass, STATUS_BADGE } from "../../../utils/themeClasses";
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
  const timezone = useUserTimezone();

  return (
    <div className="ui-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="ui-table-head">
              <th className="px-6 py-4">Ejercicio / Título</th>
              <th className="px-6 py-4">Fecha de Cierre</th>
              <th className="px-6 py-4 text-center">Efectividad</th>
              <th className="px-6 py-4 text-right">Métricas</th>
            </tr>
          </thead>
          <tbody className="ui-table-body">
            {history?.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-slate-400 dark:text-slate-500"
                >
                  No has guardado ninguna sesión de conciliación todavía.
                </td>
              </tr>
            ) : (
              history?.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectRow(item.id)}
                  className={`ui-table-row ${
                    selectedId === item.id ? "ui-table-row-selected" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                      <span>{item.title}</span>
                      {item.status === "DRAFT" ? (
                        <span className={STATUS_BADGE.draft}>Borrador</span>
                      ) : (
                        <span className={STATUS_BADGE.completed}>Completada</span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-slate-400 dark:text-slate-500">
                      {item.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {formatDateTimeInTimezone(item.createdAt, timezone)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={getSuccessRateBadgeClass(item.successRate)}>
                      {item.successRate}% Conciliado
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.matchedCount}
                      </span>{" "}
                      Cruces
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
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
