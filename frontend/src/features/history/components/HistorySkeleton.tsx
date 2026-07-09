import React from "react";

export const HistorySkeleton: React.FC = () => (
  <div className="ui-card flex h-64 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
    <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">
      Cargando historial contable...
    </span>
  </div>
);
