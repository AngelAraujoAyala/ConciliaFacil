import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  accentColor?: "indigo" | "emerald" | "amber" | "slate";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  isLoading = false,
  accentColor = "indigo",
}) => {
  const accentClasses = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded-md w-24" />
          <div className="h-8 w-8 bg-slate-200 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-36" />
          <div className="h-3 bg-slate-200 rounded-md w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start gap-4">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <div className={`p-2 rounded-xl border ${accentClasses[accentColor]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
};
