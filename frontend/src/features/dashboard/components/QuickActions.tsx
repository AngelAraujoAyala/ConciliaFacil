import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useConciliationStore } from "../../../store/useConciliationStore";
import { apiClient } from "../../../api/apiClient";
import type { ConciliationDetail } from "../../conciliation/types/history.types";

interface QuickActionsProps {
  selectedConciliationId: string | null;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ selectedConciliationId }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const loadSnapshot = useConciliationStore((state) => state.loadSnapshot);

  const handleResume = async () => {
    if (!selectedConciliationId || !user?.id) return;
    try {
      setIsLoading(true);
      const { data } = await apiClient.get<ConciliationDetail>(
        `/reconciliations/${selectedConciliationId}`,
        { params: { userId: user.id } }
      );

      loadSnapshot(data);
      navigate("/home/nueva-conciliacion");
    } catch (error) {
      console.error("Error al reanudar la conciliación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    {
      title: "Nueva Conciliación",
      description: "Ejecutar cruce M:N automático o manual.",
      icon: <PlusCircle className="h-5 w-5" />,
      color: "bg-indigo-600 hover:bg-indigo-700 text-white",
      descColor: "text-indigo-100",
      onClick: () => navigate("/home/nueva-conciliacion"),
    },
    {
      title: "Soporte y Ayuda",
      description: "Centro de ayuda y plantillas de Excel.",
      icon: <HelpCircle className="h-5 w-5" />,
      color:
        "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
      descColor: "text-slate-400 dark:text-slate-500",
      onClick: () => navigate("/home/soporte"),
    },
  ];

  return (
    <div className="ui-card-lg flex h-full flex-col space-y-4 p-6">
      <h2 className="ui-section-title">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((act, index) => (
          <button
            key={index}
            onClick={act.onClick}
            className={`group flex w-full cursor-pointer items-start gap-4 rounded-xl p-4 text-left transition-all duration-300 ${act.color}`}
          >
            <div className="mt-0.5 transition-transform duration-300 group-hover:scale-105">
              {act.icon}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold">{act.title}</h3>
              <p className={`text-xs ${act.descColor}`}>{act.description}</p>
            </div>
          </button>
        ))}

        <div className="ui-divider mt-2 border-t pt-4">
          <button
            onClick={handleResume}
            disabled={!selectedConciliationId || isLoading}
            className={`group flex w-full items-center justify-between rounded-xl p-4 text-left transition-all duration-300 ${
              selectedConciliationId
                ? "cursor-pointer border border-amber-200 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
                : "cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400 opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${
                  selectedConciliationId
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                    : "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </div>
              <span className="text-sm font-bold">
                {isLoading ? "Cargando..." : "Reanudar Conciliación"}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
