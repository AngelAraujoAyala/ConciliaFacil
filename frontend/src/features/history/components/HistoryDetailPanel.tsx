import React, { useMemo } from "react";
import type { ConciliationDetail } from "../../conciliation/types/history.types";

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
  // 🧮 Memorizamos los cálculos basados en el comportamiento del motor
  const metrics = useMemo(() => {
    if (!detail) return { realMatchesCount: 0, totalUnreconciled: 0 };

    // 1. Los cruces reales son aquellos que no se quedaron en estado de fallo
    const realMatchesCount = detail.matches.filter(
      (m) => m.status !== "NO_MATCH" && m.matchedInvoice !== null,
    ).length;

    // 2. La diferencia total real de elementos huérfanos en el snapshot
    const totalUnreconciled =
      detail.remainingInvoices.length + detail.remainingBankMovements.length;

    return {
      realMatchesCount,
      totalUnreconciled,
    };
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
        </p>
      </div>

      <hr className="border-slate-100" />

      {/* Tarjetas de Indicadores Principales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-400 font-medium">
            Cruces Exitosos
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

      {/* desglose de la Estructura Interna del JSONB */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Estructura del Snapshot
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs p-2.5 rounded-md bg-slate-50 text-slate-700 font-medium">
            <span>Lista de Cruces:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border shadow-sm">
              {metrics.realMatchesCount} exitosos / {detail.matches.length}{" "}
              filas
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

      <div className="pt-2">
        <button
          onClick={() => console.log("Exportar reporte para:", detail.id)}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2 text-slate-500"
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
          Exportar Auditoría (.XLSX)
        </button>
      </div>
    </div>
  );
};
