import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useGetProfile } from "../hooks/useGetProfile";
import { Sparkles, ArrowRight } from "lucide-react";
import type { UserPlan } from "../../../types";

interface PlanBadgeConfig {
  label: string;
  badgeClasses: string;
  description: string;
  icon?: React.ReactNode;
}

const PLAN_CONFIGS: Record<UserPlan, PlanBadgeConfig> = {
  FREE: {
    label: "Plan Gratis",
    badgeClasses: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Límite de 3 conciliaciones/mes",
  },
  BASIC: {
    label: "Plan Básico",
    badgeClasses: "bg-indigo-50 text-indigo-800 border-indigo-200",
    description: "Hasta 5 RFCs • Ilimitado",
  },
  PRO: {
    label: "Plan Pro",
    badgeClasses: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Todo ilimitado",
  },
};

export const WelcomeHeader: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useGetProfile();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
  const currentPlan: UserPlan = profile?.plan || "FREE";
  const planConfig = PLAN_CONFIGS[currentPlan];

  const showUpgradeBtn = currentPlan === "FREE" || currentPlan === "BASIC";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          ¡Hola, {displayName}! 👋
        </h1>
        <p className="text-sm text-slate-500">
          Bienvenido de vuelta a tu espacio de conciliación. Aquí tienes el resumen de hoy.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 bg-slate-50/50 border border-slate-100 rounded-xl p-3">
          <div className="space-y-0.5">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${planConfig.badgeClasses}`}>
              {currentPlan === "PRO" && <Sparkles className="h-3 w-3" />}
              {planConfig.label}
            </div>
            <p className="text-xs text-slate-500">{planConfig.description}</p>
          </div>

          {showUpgradeBtn && (
            <button
              onClick={() => navigate("/home/planes")}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
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
