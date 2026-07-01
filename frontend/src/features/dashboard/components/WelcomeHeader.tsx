import React from "react";
import { useAuthStore } from "../../../store/authStore";
import { Sparkles, ArrowRight } from "lucide-react";

export const WelcomeHeader: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";
  const plan = (user?.user_metadata?.plan as "Gratis" | "Premium") || "Gratis";

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
        {plan === "Premium" ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Plan Premium
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-amber-50/50 border border-amber-100 rounded-xl p-3">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                Plan Gratis
              </div>
              <p className="text-xs text-slate-500">Límite de 3 conciliaciones/mes</p>
            </div>
            <button
              onClick={() => alert("¡Próximamente disponible! Pasarela de pago en construcción.")}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Mejorar Plan
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
