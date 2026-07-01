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
      // 1. Cargar el JSONB completo del borrador desde el backend
      const { data } = await apiClient.get<ConciliationDetail>(
        `/reconciliations/${selectedConciliationId}`,
        { params: { userId: user.id } }
      );
      
      // 2. Hidratar el store global con el snapshot
      loadSnapshot(data);
      
      // 3. Redirigir a la pantalla interactiva
      navigate("/home/nueva-conciliacion");
    } catch (error) {
      console.error("Error al reanudar la conciliación:", error);
      // Aquí se podría mostrar un toast de error
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
      onClick: () => navigate("/home/nueva-conciliacion"),
    },
    {
      title: "Soporte y Ayuda",
      description: "Centro de ayuda y plantillas de Excel.",
      icon: <HelpCircle className="h-5 w-5" />,
      color: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
      onClick: () => navigate("/home/soporte"),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col h-full">
      <h2 className="text-base font-bold text-slate-900">
        Acciones Rápidas
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((act, index) => (
          <button
            key={index}
            onClick={act.onClick}
            className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-start gap-4 group cursor-pointer ${act.color}`}
          >
            <div className="mt-0.5 group-hover:scale-105 transition-transform duration-300">
              {act.icon}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold">{act.title}</h3>
              <p className={`text-xs ${act.color.includes("indigo") ? "text-indigo-100" : "text-slate-400"}`}>
                {act.description}
              </p>
            </div>
          </button>
        ))}

        <div className="pt-4 border-t border-slate-100 mt-2">
          <button
            onClick={handleResume}
            disabled={!selectedConciliationId || isLoading}
            className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center justify-between group
              ${
                selectedConciliationId
                  ? "bg-amber-50 border border-amber-200 text-amber-700 cursor-pointer shadow-sm hover:bg-amber-100"
                  : "bg-slate-50 border border-slate-100 text-slate-400 opacity-60 cursor-not-allowed"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedConciliationId ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
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
