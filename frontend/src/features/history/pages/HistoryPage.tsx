import React, { useState } from "react";
import { useConciliationHistory, useConciliationDetail } from "../../conciliation/hooks/useConciliationHistory";
import { HistoryTable } from "../components/HistoryTable";
import { HistoryDetailPanel } from "../components/HistoryDetailPanel";
import { HistorySkeleton } from "../components/HistorySkeleton";
import { useFilteredHistory } from "../hooks/useFilteredHistory";

export const HistoryPage: React.FC = () => {
  const { data: history, isLoading, isError, error } = useConciliationHistory();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredHistory,
  } = useFilteredHistory(history);

  // Consulta detallada perezosa (Lazy)
  const { data: detail, isLoading: isLoadingDetail } =
    useConciliationDetail(selectedId);

  if (isLoading) return <HistorySkeleton />;

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 max-w-7xl mx-auto m-6">
        <h3 className="font-semibold">Error al cargar el histórico</h3>
        <p className="text-sm">
          {(error as Error).message || "Por favor intente más tarde."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Historial de Conciliaciones
        </h1>
        <p className="text-sm text-slate-500">
          Audita, consulta y descarga los reportes y snapshots de tus ejercicios
          de conciliación previos.
        </p>
      </div>

      {/* 🔍 BARRA DE BÚSQUEDA Y FILTROS PREMIUM */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título de conciliación..."
            className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Control Segmentado (Filtros de Estado) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-white text-slate-800 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("DRAFT")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
              statusFilter === "DRAFT"
                ? "bg-amber-500 text-white shadow-sm font-bold"
                : "text-slate-500 hover:text-amber-600"
            }`}
          >
            Borradores
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
              statusFilter === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-sm font-bold"
                : "text-slate-500 hover:text-emerald-600"
            }`}
          >
            Completadas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COMPONENTE: LISTADO DE AUDITORÍAS */}
        <div className="lg:col-span-2">
          <HistoryTable
            history={filteredHistory}
            selectedId={selectedId}
            onSelectRow={setSelectedId}
          />
        </div>

        {/* COMPONENTE: DETALLE DEL SNAPSHOT */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <HistoryDetailPanel
            selectedId={selectedId}
            detail={detail}
            isLoadingDetail={isLoadingDetail}
          />
        </div>
      </div>
    </div>
  );
};
