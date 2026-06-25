import React, { useState } from "react";
import { useConciliationHistory, useConciliationDetail } from "../../conciliation/hooks/useConciliationHistory";
import { HistoryTable } from "../components/HistoryTable";
import { HistoryDetailPanel } from "../components/HistoryDetailPanel";
import { HistorySkeleton } from "../components/HistorySkeleton";

export const HistoryPage: React.FC = () => {
  const { data: history, isLoading, isError, error } = useConciliationHistory();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COMPONENTE: LISTADO DE AUDITORÍAS */}
        <div className="lg:col-span-2">
          <HistoryTable
            history={history}
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
