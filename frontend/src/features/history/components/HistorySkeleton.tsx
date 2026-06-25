import React from "react";

export const HistorySkeleton: React.FC = () => (
  <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
    <span className="ml-3 text-sm font-medium text-slate-600">
      Cargando historial contable...
    </span>
  </div>
);
