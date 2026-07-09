interface SummaryCardsProps {
  summary: {
    successRate: number;
    unreconciledBank: number;
    reviewNeeded: number;
    unreconciledInvoices: number;
  };
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-medium text-gray-400 dark:text-slate-550 block">
          Efectividad Global
        </span>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            {summary.successRate}%
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all"
            style={{ width: `${summary.successRate}%` }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-medium text-gray-400 dark:text-slate-550 block">
          Sin Factura (Banco)
        </span>
        <span className="text-2xl font-bold text-red-500 mt-1 block">
          {summary.unreconciledBank}
        </span>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
          Requieren asignación manual
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-medium text-gray-400 dark:text-slate-550 block">
          Desfases Pendientes
        </span>
        <span className="text-2xl font-bold text-amber-500 mt-1 block">
          {summary.reviewNeeded}
        </span>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
          Diferencias por revisar/aprobar
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm bg-linear-to-br from-blue-50/40 to-emerald-50/20 dark:from-blue-950/20 dark:to-emerald-950/20">
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 block">
          Facturas Disponibles (SAT)
        </span>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-300 mt-1 block">
          {summary.unreconciledInvoices}
        </span>
        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-450 mt-1">
          Disponibles en el selector
        </p>
      </div>
    </div>
  );
}
