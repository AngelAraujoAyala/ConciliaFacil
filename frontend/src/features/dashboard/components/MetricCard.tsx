import React from "react";
import { METRIC_ACCENT } from "../../../utils/themeClasses";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  accentColor?: keyof typeof METRIC_ACCENT;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  isLoading = false,
  accentColor = "indigo",
}) => {
  if (isLoading) {
    return (
      <div className="ui-card-lg animate-pulse space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-36 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-48 rounded-md bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="ui-card-lg flex flex-col justify-between p-6 transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`p-2 ${METRIC_ACCENT[accentColor]}`}>{icon}</div>
      </div>
      <div className="mt-4 space-y-1">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </span>
        <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
      </div>
    </div>
  );
};
