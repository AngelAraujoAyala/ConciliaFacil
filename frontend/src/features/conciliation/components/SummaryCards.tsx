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
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-xs font-medium text-gray-400 block">
          Efectividad Global
        </span>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-2xl font-bold text-gray-800">
            {summary.successRate}%
          </span>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all"
            style={{ width: `${summary.successRate}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-xs font-medium text-gray-400 block">
          Sin Factura (Banco)
        </span>
        <span className="text-2xl font-bold text-red-500 mt-1 block">
          {summary.unreconciledBank}
        </span>
        <p className="text-[10px] text-gray-400 mt-1">
          Requieren asignación manual
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-xs font-medium text-gray-400 block">
          Desfases Pendientes
        </span>
        <span className="text-2xl font-bold text-amber-500 mt-1 block">
          {summary.reviewNeeded}
        </span>
        <p className="text-[10px] text-gray-400 mt-1">
          Diferencias por revisar/aprobar
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm bg-linear-to-br from-blue-50/40 to-emerald-50/20">
        <span className="text-xs font-medium text-emerald-700 block">
          Facturas Disponibles (SAT)
        </span>
        <span className="text-2xl font-bold text-emerald-600 mt-1 block">
          {summary.unreconciledInvoices}
        </span>
        <p className="text-[10px] text-emerald-600/80 mt-1">
          Disponibles en el selector
        </p>
      </div>
    </div>
  );
}
