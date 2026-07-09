import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowUpRight, FolderOpen, Loader2 } from "lucide-react";
import { useConciliationHistory } from "../../conciliation/hooks/useConciliationHistory";
import type { ConciliationSummary, ConciliationDetail } from "../../conciliation/types/history.types";
import { useAuthStore } from "../../../store/authStore";
import { useConciliationStore } from "../../../store/useConciliationStore";
import { apiClient } from "../../../api/apiClient";

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-slate-50 dark:divide-slate-800">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="ml-auto h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-12 text-center">
      <div className="rounded-full border border-amber-100 bg-amber-50 p-4 text-amber-400 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-500">
        <FolderOpen className="h-10 w-10" />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Sin borradores pendientes</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          No tienes conciliaciones guardadas como borrador. Inicia una nueva para procesarla más tarde.
        </p>
      </div>
      <button
        onClick={onStart}
        className="mt-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-xl transition-colors shadow-sm cursor-pointer"
      >
        Iniciar nueva conciliación
      </button>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

interface RecentConciliationsTableProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const RecentConciliationsTable: React.FC<RecentConciliationsTableProps> = ({
  selectedId,
  onSelect,
}) => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const loadSnapshot = useConciliationStore((state) => state.loadSnapshot);

  // Usamos el hook real que consulta el backend (GET /reconciliations)
  const { data: allConciliations, isLoading, isError } = useConciliationHistory();

  // Filtramos únicamente los BORRADORES y mostramos los 5 más recientes
  const drafts: ConciliationSummary[] = (allConciliations ?? [])
    .filter((c) => c.status === "DRAFT")
    .slice(0, 5);

  const hasDrafts = drafts.length > 0;

  const handleStartFirst = () => {
    navigate("/home/nueva-conciliacion");
  };

  const handleResume = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    try {
      setLoadingId(draftId);
      const { data } = await apiClient.get<ConciliationDetail>(
        `/reconciliations/${draftId}`,
        { params: { userId: user.id } }
      );
      loadSnapshot(data);
      navigate("/home/nueva-conciliacion");
    } catch (error) {
      console.error("Error al cargar la conciliación:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="ui-card-lg flex flex-col overflow-hidden">
      <div className="ui-divider flex items-center justify-between border-b p-5">
        <h2 className="ui-section-title flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <span>
            Conciliaciones Pendientes{" "}
            <span className="text-amber-500">(Borradores)</span>
          </span>
        </h2>
        {hasDrafts && (
          <button
            onClick={() => navigate("/home/historial")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            Ver todo
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto">
        {/* Estado de carga */}
        {isLoading && <TableSkeleton />}

        {/* Estado de error */}
        {isError && !isLoading && (
          <div className="ui-alert-error-inline p-6 text-center">
            Error al cargar los borradores. Verifica tu conexión con el servidor.
          </div>
        )}

        {/* Estado vacío */}
        {!isLoading && !isError && !hasDrafts && (
          <EmptyState onStart={handleStartFirst} />
        )}

        {/* Tabla de datos */}
        {!isLoading && !isError && hasDrafts && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="ui-table-head text-[10px]">
                <th className="py-3 px-5">Título / Conciliación</th>
                <th className="py-3 px-5">Creada</th>
                <th className="py-3 px-5 text-center">Facturas (XML)</th>
                <th className="py-3 px-5 text-center">Movimientos</th>
                <th className="py-3 px-5 text-center">% Éxito</th>
                <th className="py-3 px-5 text-center">Estatus</th>
                <th className="py-3 px-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="ui-table-body text-xs text-slate-600 dark:text-slate-400">
              {drafts.map((draft) => (
                <tr
                  key={draft.id}
                  onClick={() => onSelect(draft.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedId === draft.id
                      ? "border-l-4 border-l-indigo-500 bg-indigo-50/70 dark:border-l-indigo-400 dark:bg-indigo-950/40"
                      : "hover:bg-amber-50/30 dark:hover:bg-amber-950/20"
                  }`}
                >
                  <td className="max-w-[220px] truncate px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                    {draft.title || "Sin título"}
                  </td>

                  {/* Fecha formateada del campo `createdAt` */}
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-400 dark:text-slate-500">
                    {new Date(draft.createdAt).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Conteos de escalar — campos directos en la tabla Prisma */}
                  <td className="px-5 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {draft.totalInvoices}
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {draft.totalBankMovements}
                  </td>

                  {/* Tasa de éxito como porcentaje */}
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`font-bold ${
                        draft.successRate >= 80
                          ? "text-emerald-600 dark:text-emerald-400"
                          : draft.successRate >= 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {draft.successRate}%
                    </span>
                  </td>

                  {/* Badge de estatus — siempre "Borrador" en este filtro */}
                  <td className="py-3.5 px-5 text-center">
                    <span className="ui-badge-draft gap-1 rounded-full">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      Borrador
                    </span>
                  </td>

                  {/* Botón de acción: Continuar redirige tras hidratar el store */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={(e) => handleResume(draft.id, e)}
                      disabled={loadingId !== null}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition cursor-pointer disabled:opacity-50 flex items-center justify-end gap-1 ml-auto"
                    >
                      {loadingId === draft.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Cargando
                        </>
                      ) : (
                        "Continuar →"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
