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

  const { data: detail, isLoading: isLoadingDetail } =
    useConciliationDetail(selectedId);

  if (isLoading) return <HistorySkeleton />;

  if (isError) {
    return (
      <div className="ui-alert-error mx-auto m-6 max-w-7xl">
        <h3 className="font-semibold">Error al cargar el histórico</h3>
        <p className="text-sm">
          {(error as Error).message || "Por favor intente más tarde."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="ui-page-title">Historial de Conciliaciones</h1>
        <p className="ui-page-subtitle">
          Audita, consulta y descarga los reportes y snapshots de tus ejercicios
          de conciliación previos.
        </p>
      </div>

      <div className="ui-card flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg
              className="h-5 w-5"
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
            className="ui-input pl-10 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="ui-segment-group">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`ui-segment-btn cursor-pointer ${
              statusFilter === "ALL" ? "ui-segment-btn-active" : ""
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("DRAFT")}
            className={`ui-segment-btn cursor-pointer ${
              statusFilter === "DRAFT"
                ? "rounded-lg bg-amber-500 font-bold text-white shadow-sm"
                : "hover:text-amber-600 dark:hover:text-amber-400"
            }`}
          >
            Borradores
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`ui-segment-btn cursor-pointer ${
              statusFilter === "COMPLETED"
                ? "rounded-lg bg-emerald-600 font-bold text-white shadow-sm"
                : "hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            Completadas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HistoryTable
            history={filteredHistory}
            selectedId={selectedId}
            onSelectRow={setSelectedId}
          />
        </div>

        <div className="ui-card p-6">
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
