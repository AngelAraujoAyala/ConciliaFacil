import React from "react";
import { MetricCard } from "./MetricCard";
import { useAuthStore } from "../../../store/authStore";
import { useConciliationHistory } from "../../conciliation/hooks/useConciliationHistory";
import { BarChart3, Landmark, Calendar } from "lucide-react";
import type { BankMovement } from "../../../types";

const PLAN_LIMITS = {
  Gratis: 3,
  Premium: 50,
  Despacho: 200,
};

export const MetricsGrid: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { data: history } = useConciliationHistory();

  // 1. Tarjeta 1: Uso Mensual del Plan y Reinicio del Contador
  const rawPlan = user?.user_metadata?.plan;
  const plan = (rawPlan === "Gratis" || rawPlan === "Premium" || rawPlan === "Despacho" ? rawPlan : "Gratis") as keyof typeof PLAN_LIMITS;

  const limit = PLAN_LIMITS[plan] || 3;
  const isPremiumUnlimited = plan === "Premium"; // Manejo de excepción para Premium ilimitado

  // Contamos las conciliaciones realizadas (o todas las registradas) para el consumo
  const usageCount = history?.length || 0;
  const usageValue = isPremiumUnlimited ? "Ilimitadas" : `${usageCount} / ${limit}`;

  // Cálculo dinámico de días restantes para el próximo mes
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const usageDescription = `Faltan ${diffDays} días para el reinicio de tu contador`;

  // 2. Tarjeta 2: Progreso de Cuadre en Conciliaciones Pendientes (Borradores)
  const drafts = (history ?? []).filter((c) => c.status === "DRAFT");

  let montoTotal = 0;
  let montoCuadrado = 0;

  drafts.forEach((draft) => {
    const movs = (typeof draft.movements === "string"
      ? JSON.parse(draft.movements)
      : draft.movements) as BankMovement[] | undefined;

    if (Array.isArray(movs)) {
      movs.forEach((m) => {
        const amount = m.amount || 0;
        montoTotal += amount;
        if (m.status === "MATCHED" || (m.matchedInvoiceIds && m.matchedInvoiceIds.length > 0)) {
          montoCuadrado += amount;
        }
      });
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

  // 3. Tarjeta 3: Última Actividad (Sin Fallbacks Mocks)
  let lastActivityValue = "Aún no hay conciliaciones";
  let lastActivityDesc = "Inicia un proceso para ver actividad";

  if (history && history.length > 0) {
    const dates = history.map((c) => new Date(c.createdAt).getTime());
    const maxDate = new Date(Math.max(...dates));

    const day = String(maxDate.getDate()).padStart(2, "0");
    const month = String(maxDate.getMonth() + 1).padStart(2, "0");
    const year = maxDate.getFullYear();
    const hours = String(maxDate.getHours()).padStart(2, "0");
    const minutes = String(maxDate.getMinutes()).padStart(2, "0");

    lastActivityValue = `${day}/${month}/${year} - ${hours}:${minutes} hrs`;
    lastActivityDesc = "Fecha y hora de la última operación";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Uso Mensual del Plan"
        value={usageValue}
        description={usageDescription}
        icon={<BarChart3 className="h-5 w-5" />}
        accentColor={isPremiumUnlimited ? "emerald" : "indigo"}
      />
      <MetricCard
        title="Progreso de Cuadre"
        value={formattedProgreso}
        description={amountDescription}
        icon={<Landmark className="h-5 w-5" />}
        accentColor="indigo"
      />
      <MetricCard
        title="Última Actividad"
        value={lastActivityValue}
        description={lastActivityDesc}
        icon={<Calendar className="h-5 w-5" />}
        accentColor="amber"
      />
    </div>
  );
};
