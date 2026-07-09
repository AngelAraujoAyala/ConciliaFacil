import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetProfile } from "../hooks/useGetProfile";
import { useDisplayName } from "../../../hooks/useDisplayName";
import { Sparkles, ArrowRight } from "lucide-react";
import type { UserPlan } from "../../../types";
import { PLAN_BADGE } from "../../../utils/themeClasses";

const PLAN_CONFIGS: Record<UserPlan, { label: string; description: string }> = {
  FREE: { label: "Plan Gratis", description: "Límite de 3 conciliaciones/mes" },
  BASIC: { label: "Plan Básico", description: "Hasta 5 RFCs • Ilimitado" },
  PRO: { label: "Plan Pro", description: "Todo ilimitado" },
};

export const WelcomeHeader: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile } = useGetProfile();

  const displayName = useDisplayName();
  const currentPlan: UserPlan = profile?.plan || "FREE";
  const planConfig = PLAN_CONFIGS[currentPlan];

  const showUpgradeBtn = currentPlan === "FREE" || currentPlan === "BASIC";

  return (
    <div className="ui-card-lg flex flex-col justify-between gap-6 p-6 transition-all duration-300 md:flex-row md:items-center">
      <div className="space-y-1">
        <h1 className="ui-page-title flex items-center gap-2">
          ¡Hola, {displayName}! 👋
        </h1>
        <p className="ui-page-subtitle">
          Bienvenido de vuelta a tu espacio de conciliación. Aquí tienes el resumen de hoy.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="ui-surface-muted flex items-center gap-4 rounded-xl border border-slate-100 p-3 dark:border-slate-700">
          <div className="space-y-0.5">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${PLAN_BADGE[currentPlan]}`}
            >
              {currentPlan === "PRO" && <Sparkles className="h-3 w-3" />}
              {planConfig.label}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{planConfig.description}</p>
          </div>

          {showUpgradeBtn && (
            <button
              onClick={() => navigate("/home/planes")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
            >
              Mejorar
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
