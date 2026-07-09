import type { InvoiceXML } from "../../../types";

interface UnmatchedInvoicesTableProps {
  unmatchedInvoices: InvoiceXML[];
}

export default function UnmatchedInvoicesTable({
  unmatchedInvoices,
}: UnmatchedInvoicesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (unmatchedInvoices.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-400 dark:text-slate-500">
        No hay facturas huérfanas libres.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-gray-50 dark:bg-slate-800/80 text-[11px] text-gray-400 dark:text-slate-400 font-bold uppercase">
          <tr>
            <th className="p-4">Fecha Factura</th>
            <th className="p-4">UUID Breve</th>
            <th className="p-4">Contribuyente</th>
            <th className="p-4 text-right">Total Factura</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
          {unmatchedInvoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-purple-50/10 dark:hover:bg-slate-800/20">
              <td className="p-4 font-mono text-gray-500 dark:text-slate-400">{inv.date}</td>
              <td className="p-4">
                <span className="font-mono text-gray-400 dark:text-slate-500 block">
                  ...{inv.uuid.substring(24)}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${inv.type === "INGRESO" ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}
                >
                  {inv.type}
                </span>
              </td>
              <td className="p-4 font-medium text-gray-700 dark:text-slate-200">
                {inv.type === "INGRESO" ? inv.nameReceptor : inv.nameEmisor}
              </td>
              <td className="p-4 text-right font-bold text-gray-800 dark:text-slate-100">
                {formatCurrency(inv.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
