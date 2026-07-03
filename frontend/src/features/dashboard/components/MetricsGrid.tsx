import React from "react";
import { MetricCard } from "./MetricCard";
import { useGetProfile } from "../hooks/useGetProfile";
import { useConciliationHistory } from "../../conciliation/hooks/useConciliationHistory";
import { BarChart3, Landmark, Building2 } from "lucide-react";
import type { BankMovement } from "../../../types";

export const MetricsGrid: React.FC = () => {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const { data: history } = useConciliationHistory();

  // 1. Tarjeta 1: Uso Mensual del Plan y Reinicio del Contador
  const isUnlimited = profile?.plan === "BASIC" || profile?.plan === "PRO";
  const limitText = isUnlimited ? "ilimitadas" : "3";
  const usageCount = profile?.monthlyConciliations ?? 0;
  const usageValue = `${usageCount} / ${limitText}`;

  // Cálculo dinámico de días restantes para el próximo mes basándose en nextResetDate de la BD
  const now = new Date();
  const nextReset = profile?.nextResetDate ? new Date(profile.nextResetDate) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextReset.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const usageDescription = diffDays > 0 
    ? `Faltan ${diffDays} día${diffDays === 1 ? "" : "s"} para el reinicio de tu contador` 
    : "Tu contador se reiniciará hoy";

  // 2. Tarjeta 2: Progreso de Cuadre en Conciliaciones Pendientes (Borradores)
  const drafts = (history ?? []).filter((c) => c.status === "DRAFT");

  let montoTotal = 0;
  let montoCuadrado = 0;

  drafts.forEach((draft) => {
    const movs = (typeof draft.movements === "string"
      ? JSON.parse(draft.movements)
      : draft.movements) as BankMovement[] | undefined;

    if (Array.isArray(movs)) {
      const totals = movs.reduce(
        (acc, m) => {
          const amount = m.amount || 0;
          const isResolved =
            m.status === "MATCHED" ||
            !!m.isException ||
            (m.matchedInvoiceIds && m.matchedInvoiceIds.length > 0);

          return {
            total: acc.total + amount,
            squared: acc.squared + (isResolved ? amount : 0),
          };
        },
        { total: 0, squared: 0 }
      );

      montoTotal += totals.total;
      montoCuadrado += totals.squared;
    }
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(val);

  const formattedProgreso = `${formatCurrency(montoCuadrado)} / ${formatCurrency(montoTotal)} MXN`;
  const amountDescription = "Monto cuadrado en borradores actuales";

  // 3. Tarjeta 3: RFCs conciliados este mes
  const rfcCount = profile?.empresas?.length ?? 0;
  const isRfcUnlimited = profile?.plan === "PRO";
  const rfcLimitText = isRfcUnlimited ? "ilimitados" : (profile?.plan === "BASIC" ? "5" : "1");
  const rfcValue = `${rfcCount} / ${rfcLimitText}`;
  const rfcDescription = usageDescription;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Uso Mensual del Plan"
        value={usageValue}
        description={usageDescription}
        icon={<BarChart3 className="h-5 w-5" />}
        accentColor={isUnlimited ? "emerald" : "indigo"}
        isLoading={isProfileLoading}
      />
      <MetricCard
        title="Progreso de Cuadre"
        value={formattedProgreso}
        description={amountDescription}
        icon={<Landmark className="h-5 w-5" />}
        accentColor="indigo"
      />
      <MetricCard
        title="RFCs Conciliados este Mes"
        value={rfcValue}
        description={rfcDescription}
        icon={<Building2 className="h-5 w-5" />}
        accentColor={isRfcUnlimited ? "emerald" : "amber"}
        isLoading={isProfileLoading}
      />
    </div>
  );
};
