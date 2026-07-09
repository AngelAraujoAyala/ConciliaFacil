/** Clases reutilizables para badges y estados semánticos con soporte dark mode. */

export function getSuccessRateBadgeClass(rate: number): string {
  if (rate === 100) return "ui-badge-success";
  if (rate >= 70) return "ui-badge-warning";
  return "ui-badge-danger";
}

export const STATUS_BADGE = {
  draft: "ui-badge-draft",
  completed: "ui-badge-info",
} as const;

export const PLAN_BADGE = {
  FREE: "ui-badge-plan-free",
  BASIC: "ui-badge-plan-basic",
  PRO: "ui-badge-plan-pro",
} as const;

export const METRIC_ACCENT = {
  indigo: "ui-accent-indigo",
  emerald: "ui-accent-emerald",
  amber: "ui-accent-amber",
  slate: "ui-accent-slate",
} as const;

export const MOVEMENT_TYPE_BADGE = {
  INGRESO: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50",
  EGRESO: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50",
} as const;

export const GROUP_STATUS_BADGE = {
  TOTAL_MATCH: "ui-badge-success text-[10px] font-bold rounded-full px-2 py-0.5",
  MANUAL_MATCH: "inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs dark:bg-emerald-700",
  PARTIAL_MATCH: "ui-badge-warning text-[10px] font-bold rounded-full px-2 py-0.5",
  PENDING: "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400",
} as const;
