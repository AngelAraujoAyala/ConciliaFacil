import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConciliationStore } from "../../../store/useConciliationStore";
import type { ConciliationDetail } from "../../conciliation/types/history.types";
import { getConciliatedGroups } from "../../conciliation/utils/bankMovementMetrics";
import { exportConciliationToExcel } from "../../conciliation/utils/excelExport";
import { toast } from "sonner";

interface HistoryDetailPanelProps {
  selectedId: string | null;
  detail: ConciliationDetail | undefined;
  isLoadingDetail: boolean;
}

export const HistoryDetailPanel: React.FC<HistoryDetailPanelProps> = ({
  selectedId,
  detail,
  isLoadingDetail,
}) => {
  const navigate = useNavigate();
  const loadSnapshot = useConciliationStore((state) => state.loadSnapshot);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!detail) return;
    try {
      setIsExporting(true);
      await exportConciliationToExcel(detail);
      toast.success("Exportación completada", {
        description: `El archivo “${detail.title}.xlsx” se ha descargado correctamente.`,
        duration: 4000,
      });
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar", {
        description: "No se pudo generar el archivo Excel. Intenta de nuevo.",
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleResume = () => {
    if (!detail) return;
    loadSnapshot({
      id: detail.id,
      title: detail.title,
      matches: detail.matches,
      movements: detail.movements ?? [],
      invoices: detail.invoices ?? [],
      remainingInvoices: detail.remainingInvoices,
      remainingBankMovements: detail.remainingBankMovements,
    });
    navigate("/home/nueva-conciliacion");
  };

  const metrics = useMemo(() => {
    if (!detail) return { realMatchesCount: 0, totalUnreconciled: 0 };

    const realMatchesCount = getConciliatedGroups(detail.matches).length;
    const totalUnreconciled =
      detail.remainingInvoices.length + detail.remainingBankMovements.length;

    return { realMatchesCount, totalUnreconciled };
  }, [detail]);

  if (!selectedId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 min-h-87.5">
        <svg
          className="w-12 h-12 stroke-current mb-3 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm font-medium">
          Selecciona una conciliación para auditar los detalles del snapshot.
        </p>
      </div>
    );
  }

  if (isLoadingDetail) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 min-h-87.5">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 mb-2"></div>
        <p className="text-xs text-slate-500">Extrayendo registros JSONB...</p>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Detalle de Auditoría
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-0.5">
          {detail.title}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          ID: <span className="font-mono text-[11px]">{detail.id}</span>
          {detail.schemaVersion && (
            <span className="ml-2">· v{detail.schemaVersion}</span>
          )}
        </p>
      </div>

      <hr className="border-slate-100" />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-400 font-medium">
            Grupos Conciliados
          </div>
          <div className="text-lg font-bold text-slate-800">
            {metrics.realMatchesCount}
          </div>
        </div>
        <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
          <div className="text-xs text-amber-600 font-medium">
            Diferencia (Sin Cruce)
          </div>
          <div className="text-lg font-bold text-amber-800">
            {metrics.totalUnreconciled}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Estructura del Snapshot
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs p-2.5 rounded-md bg-slate-50 text-slate-700 font-medium">
            <span>Grupos M:N:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border shadow-sm">
              {metrics.realMatchesCount} conciliados / {detail.matches.length}{" "}
              grupos
            </span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 rounded-md bg-slate-50 text-slate-700 font-medium">
            <span>Facturas Huérfanas:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border shadow-sm">
              {detail.remainingInvoices.length} objetos
            </span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 rounded-md bg-slate-50 text-slate-700 font-medium">
            <span>Movimientos Huérfanos:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border shadow-sm">
              {detail.remainingBankMovements.length} objetos
            </span>
          </div>
        </div>
      </div>

      {detail.status === "DRAFT" && (
        <div className="pt-2">
          <button
            onClick={handleResume}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 duration-150 cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-2 text-white fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Reanudar Conciliación
          </button>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isExporting ? (
            <>
              <svg className="w-4 h-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Generando Excel...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Exportar Audiítoría (.XLSX)
            </>
          )}
        </button>
      </div>
    </div>
  );
};
