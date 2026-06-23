import React from "react";
import { useGetProfile } from "../hooks/useGetProfile";
import { Shield, CreditCard, FileSpreadsheet } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { data: profile, isLoading, error } = useGetProfile();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-xl">
        Error al conectar con el servidor: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Bienvenido de vuelta, {profile?.email.split("@")[0]}
        </h1>
        <p className="text-sm text-slate-500">
          Este es el estado actual de tu cuenta en ConciliaFácil
        </p>
      </div>

      {/* Grid de Métricas de tu Micro-SaaS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Plan Actual */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Plan Activo
            </p>
            <p className="text-lg font-bold text-slate-700">
              {profile?.isSubscribed
                ? "Suscripción Premium"
                : "Plan Gratuito / Demo"}
            </p>
          </div>
        </div>

        {/* Card: Conciliaciones Gratuitas Restantes */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Créditos de Conciliación
            </p>
            <p className="text-lg font-bold text-slate-700">
              {profile?.freeConciliationsLeft} restantes
            </p>
          </div>
        </div>

        {/* Card: Historial Acumulado */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Procesadas con éxito
            </p>
            <p className="text-lg font-bold text-slate-700">
              {profile?._count.conciliations} ejecuciones
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
        ✓ Prueba End-to-End Exitosa: El JWT fue inyectado, verificado por NestJS
        y resuelto mediante Prisma ORM.
      </div>
    </div>
  );
};
