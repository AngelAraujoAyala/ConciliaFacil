import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Zap, ExternalLink, Loader2 } from "lucide-react";
import { useGetProfile } from "../../hooks/useGetProfile";
import { useBillingPortal } from "../../hooks/useBillingPortal";
import type { UserPlan } from "../../../../types";

const PLAN_LIMITS: Record<UserPlan, { conciliations: number | null; rfcs: number | null; label: string }> = {
  FREE: { conciliations: 3, rfcs: 1, label: "Plan Gratis" },
  BASIC: { conciliations: null, rfcs: 5, label: "Plan Básico" },
  PRO: { conciliations: null, rfcs: null, label: "Plan Pro" },
};

const UsageBar: React.FC<{ label: string; used: number; max: number | null }> = ({
  label,
  used,
  max,
}) => {
  const pct = max === null ? 0 : Math.min((used / max) * 100, 100);
  const isUnlimited = max === null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {isUnlimited ? (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ilimitado</span>
          ) : (
            <>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{used}</span> / {max}
            </>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {!isUnlimited && (
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-indigo-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        )}
        {isUnlimited && (
          <div className="h-full w-full rounded-full bg-emerald-400/30" />
        )}
      </div>
    </div>
  );
};

export const BillingTab: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetProfile();
  const { mutate: openBillingPortal, isPending: isPortalLoading } = useBillingPortal();

  const plan: UserPlan = profile?.plan ?? "FREE";
  const limits = PLAN_LIMITS[plan];

  const handleOpenPortal = () => {
    openBillingPortal({ returnUrl: window.location.href });
  };

  return (
    <section className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Facturación</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Revisa tu plan actual, el uso del mes y administra tu suscripción.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4 dark:border-indigo-950/40 dark:bg-indigo-950/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 shadow-sm dark:bg-indigo-500">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
            Plan actual
          </p>
          <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{limits.label}</p>
          {profile?.subscriptionStatus && (
            <p className="text-xs text-indigo-600 dark:text-indigo-300 capitalize">
              Suscripción: {profile.subscriptionStatus}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Uso este mes</p>

        {isLoading ? (
          <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <div className="space-y-4">
            <UsageBar
              label="Conciliaciones"
              used={profile?.monthlyConciliations ?? 0}
              max={limits.conciliations}
            />
            <UsageBar
              label="RFCs activos"
              used={profile?.empresas?.length ?? 0}
              max={limits.rfcs}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate("/home/planes")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <CreditCard className="h-4 w-4" />
          Administrar plan
        </button>
        <button
          type="button"
          onClick={handleOpenPortal}
          disabled={isPortalLoading || !profile?.stripeCustomerId}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {isPortalLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Portal de facturación
        </button>
      </div>
    </section>
  );
};
