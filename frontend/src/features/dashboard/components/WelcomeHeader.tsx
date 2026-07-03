import React, { useState } from "react";
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
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useGetProfile();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Mejorar
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Upgrade Plan */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100 transform scale-100 transition-transform">
            <div className="flex items-center space-x-3 text-amber-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <h3 className="font-bold text-lg text-gray-900">Mejorar Plan (Próximamente)</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Estamos preparando las pasarelas de pago y opciones de suscripción para darte la mejor experiencia. 
              ¡Gracias por tu interés en potenciar tus conciliaciones con nosotros! Te avisaremos muy pronto.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="py-2 px-5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition duration-150"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
