import type {
  BankMovement,
  ConciliationGroup,
  ConciliationGroupStatus,
  InvoiceXML,
} from "../../../types";

interface GroupsTableProps {
  groups: ConciliationGroup[];
  movements: BankMovement[];
  invoices: InvoiceXML[];
  activeTab: "ALL" | "MATCHED" | "ISSUES";
  onApproveDiscrepancy: (groupId: string) => void;
  onUnmatch: (groupId: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    amount,
  );

function filterGroupsByTab(
  groups: ConciliationGroup[],
  activeTab: "ALL" | "MATCHED" | "ISSUES",
): ConciliationGroup[] {
  if (activeTab === "MATCHED") {
    return groups.filter(
      (g) => g.status === "TOTAL_MATCH" || g.status === "MANUAL_MATCH",
    );
  }
  if (activeTab === "ISSUES") {
    return groups.filter(
      (g) => g.status === "PARTIAL_MATCH" || g.status === "PENDING",
    );
  }
  return groups;
}

function StatusBadge({ status }: { status: ConciliationGroupStatus }) {
  if (status === "TOTAL_MATCH") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
        🟢 Match Perfecto
      </span>
    );
  }
  if (status === "MANUAL_MATCH") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
        🟢 Desfase Aprobado
      </span>
    );
  }
  if (status === "PARTIAL_MATCH") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
        🟡 Desfase Dinero
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
      ⏳ Pendiente
    </span>
  );
}

export default function GroupsTable({
  groups,
  movements,
  invoices,
  activeTab,
  onApproveDiscrepancy,
  onUnmatch,
}: GroupsTableProps) {
  const filtered = filterGroupsByTab(groups, activeTab);

  const movementMap = new Map(movements.map((m) => [m.id, m]));
  const invoiceMap = new Map(invoices.map((inv) => [inv.id, inv]));

  if (filtered.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        No hay grupos de conciliación en esta categoría.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs min-w-200">
        <thead className="bg-gray-50 text-[11px] text-gray-400 font-bold uppercase">
          <tr>
            <th className="p-4 w-[30%]">🏦 Movimientos</th>
            <th className="p-4 w-[30%]">📁 Facturas</th>
            <th className="p-4 w-[16%] text-center">Estado</th>
            <th className="p-4 w-[12%] text-right">Diferencia</th>
            <th className="p-4 w-[12%] text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map((group) => {
            const groupMovements = group.bankMovementIds
              .map((id) => movementMap.get(id))
              .filter((m): m is BankMovement => !!m);
            const groupInvoices = group.invoiceIds
              .map((id) => invoiceMap.get(id))
              .filter((inv): inv is InvoiceXML => !!inv);

            return (
              <tr
                key={group.id}
                className="hover:bg-gray-50/40 transition-colors align-top"
              >
                <td className="p-4 space-y-2">
                  {groupMovements.map((bm) => (
                    <div key={bm.id} className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-400 text-[10px]">
                          {bm.date}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1 py-0.5 rounded ${bm.type === "INGRESO" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
                        >
                          {bm.type}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 truncate max-w-52">
                        {bm.description}
                      </p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(bm.amount)}
                      </p>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-100">
                    Σ {formatCurrency(group.bankTotal)}
                  </p>
                </td>

                <td className="p-4 space-y-2">
                  {groupInvoices.map((inv) => (
                    <div key={inv.id} className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-400 text-[10px]">
                          {inv.date}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 truncate max-w-52">
                        {inv.type === "INGRESO"
                          ? inv.nameReceptor
                          : inv.nameEmisor}
                      </p>
                      <p className="font-bold text-gray-900">
                        {formatCurrency(inv.total)}
                      </p>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 font-semibold pt-1 border-t border-gray-100">
                    Σ {formatCurrency(group.invoiceTotal)}
                  </p>
                </td>

                <td className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <StatusBadge status={group.status} />
                    {group.source === "MANUAL" && (
                      <span className="text-[9px] text-indigo-500 font-semibold">
                        Manual
                      </span>
                    )}
                    {group.observations && (
                      <p className="text-[9px] text-gray-400 italic max-w-32 text-center leading-tight">
                        {group.observations}
                      </p>
                    )}
                  </div>
                </td>

                <td className="p-4 text-right font-mono font-bold">
                  <span
                    className={
                      group.status === "TOTAL_MATCH" ||
                      group.status === "MANUAL_MATCH"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {formatCurrency(group.amountDelta)}
                  </span>
                </td>

                <td className="p-4 text-center space-y-1.5">
                  {group.status === "PARTIAL_MATCH" && (
                    <button
                      onClick={() => onApproveDiscrepancy(group.id)}
                      className="block w-full text-[9px] bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-2 py-1 rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      ✓ Aprobar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "¿Deshacer este cruce? Los elementos volverán a estar disponibles.",
                        )
                      ) {
                        onUnmatch(group.id);
                      }
                    }}
                    className="block w-full text-[9px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded-md border border-rose-100 transition-colors cursor-pointer"
                  >
                    ↩ Deshacer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
