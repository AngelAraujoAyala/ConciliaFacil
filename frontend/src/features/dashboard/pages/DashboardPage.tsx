import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProfile } from "../hooks/useGetProfile";
import { invalidateUserProfile } from "../../settings/utils/invalidateSettingsQueries";
import { WelcomeHeader } from "../components/WelcomeHeader";
import { MetricsGrid } from "../components/MetricsGrid";
import { RecentConciliationsTable } from "../components/RecentConciliationsTable";
import { QuickActions } from "../components/QuickActions";
import { useAuthStore } from "../../../store/authStore";

export const DashboardPage: React.FC = () => {
  const { data: profile, isLoading, error } = useGetProfile();
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // ── Estado de selección de borrador ────────────────────────────────────────
  // Vivir aquí evita contaminar el store global con estado puramente de UI.
  const [selectedConciliationId, setSelectedConciliationId] = useState<string | null>(null);

  // Callback estable para que RecentConciliationsTable no genere re-renders innecesarios
  const handleSelectDraft = useCallback((id: string | null) => {
    setSelectedConciliationId((prev) => (prev === id ? null : id)); // toggle
  }, []);

  // ── Detectar retorno desde Stripe Checkout ─────────────────────────────────
  // Stripe redirige a /home?session_id=cs_xxx al completar el pago.
  // Invalidamos el caché de React Query para forzar un refetch inmediato del
  // perfil desde NestJS/Prisma, reflejando el nuevo plan en la UI.
  useEffect(() => {
    if (searchParams.get("session_id")) {
      void invalidateUserProfile(queryClient);
      // Limpiar el parámetro de la URL sin agregar entrada al historial
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, queryClient, setSearchParams]);

  // ── Sincronizar plan de NestJS/Prisma → user_metadata ─────────────────────
  useEffect(() => {
    if (profile && user) {
      const currentPlan = profile.isSubscribed ? "Premium" : "Gratis";
      if (user.user_metadata?.plan !== currentPlan) {
        user.user_metadata = {
          ...user.user_metadata,
          plan: currentPlan,
        };
      }
    }
  }, [profile, user]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header de Bienvenida */}
      <WelcomeHeader />

      {/* 2. Grid de Métricas */}
      <MetricsGrid />

      {/* 3. Sección Principal: Tabla de Borradores + Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <RecentConciliationsTable
            selectedId={selectedConciliationId}
            onSelect={handleSelectDraft}
          />
        </div>
        <div>
          <QuickActions selectedConciliationId={selectedConciliationId} />
        </div>
      </div>
    </div>
  );
};
