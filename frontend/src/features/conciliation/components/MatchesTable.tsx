import type { ConciliationMatch, InvoiceXML } from "../../../types";

interface MatchesTableProps {
  matches: ConciliationMatch[];
  unmatchedInvoices: InvoiceXML[];
  activeTab: "ALL" | "MATCHED" | "ISSUES";
  onApproveDiscrepancy: (id: string) => void;
  onManualAssign: (matchId: string, selectedInvoiceId: string) => void;
}

export default function MatchesTable({
  matches,
  unmatchedInvoices,
  activeTab,
  onApproveDiscrepancy,
  onManualAssign,
}: MatchesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const filteredMatches = matches.filter((m) => {
    if (activeTab === "MATCHED")
      return (
        m.status === "TOTAL_MATCH" || (m.status as string) === "MANUAL_MATCH"
      );
    if (activeTab === "ISSUES")
      return m.status === "NO_MATCH" || m.status === "MULTIPLE_MATCHES";
    return true;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs min-w-225">
        <thead className="bg-gray-50 text-[11px] text-gray-400 font-bold uppercase">
          <tr>
            <th className="p-4 w-[32%]">🏦 Movimiento del Banco</th>
            <th className="p-4 w-[16%] text-center">Estado de Cruce</th>
            <th className="p-4 w-[42%]">
              📁 Factura SAT Vinculada (Modificable)
            </th>
            <th className="p-4 w-[10%] text-right">Diferencia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredMatches.map((match) => {
            const {
              bankMovement: bm,
              matchedInvoice: inv,
              observations,
              status,
            } = match;
            const diff = inv ? bm.amount - inv.total : bm.amount;
            const dynamicOptions = unmatchedInvoices.filter(
              (ui) => ui.type === bm.type,
            );

            return (
              <tr
                key={match.id}
                className="hover:bg-gray-50/40 transition-colors"
              >
                {/* COLUMNA BANCO */}
                <td className="p-4 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gray-400">{bm.date}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${bm.type === "INGRESO" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}
                    >
                      {bm.type === "INGRESO" ? "DEPÓSITO" : "RETIRO"}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 truncate max-w-60">
                    {bm.description}
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatCurrency(bm.amount)}
                  </p>
                </td>

                {/* COLUMNA ESTADO INTERACTIVO */}
                <td className="p-4 text-center align-middle">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    {status === "TOTAL_MATCH" && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        🟢 Match Perfecto
                      </span>
                    )}
                    {(status as string) === "MANUAL_MATCH" && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        🟢 Desfase Aprobado
                      </span>
                    )}
                    {status === "MULTIPLE_MATCHES" && (
                      <>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          🟡 Desfase Dinero
                        </span>
                        <button
                          onClick={() => onApproveDiscrepancy(match.id)}
                          className="text-[9px] bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-md shadow-xs transition-colors cursor-pointer"
                        >
                          ✓ Aprobar Cruce
                        </button>
                      </>
                    )}
                    {status === "NO_MATCH" && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        🔴 Sin Factura
                      </span>
                    )}
                    {observations && (
                      <p className="text-[9px] text-gray-400 mt-0.5 italic leading-tight max-w-36 text-center">
                        {observations}
                      </p>
                    )}
                  </div>
                </td>

                {/* COLUMNA SELECTOR DE INTERCAMBIO */}
                <td className="p-4 align-middle">
                  <div className="space-y-2 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                    <select
                      value={inv ? inv.id : "none"}
                      onChange={(e) => onManualAssign(match.id, e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-1 text-xs font-medium text-gray-700 shadow-sm focus:outline-none"
                    >
                      {inv ? (
                        <option value={inv.id}>
                          [Asignada] {inv.date} •{" "}
                          {inv.type === "INGRESO"
                            ? inv.nameReceptor
                            : inv.nameEmisor}{" "}
                          • {formatCurrency(inv.total)}
                        </option>
                      ) : (
                        <option value="none">
                          ⚠️ Vincular un CFDI manualmente...
                        </option>
                      )}
                      <option disabled value="">
                        --- Facturas Libres Disponibles ---
                      </option>
                      {dynamicOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.date} •{" "}
                          {opt.type === "INGRESO"
                            ? opt.nameReceptor
                            : opt.nameEmisor}{" "}
                          • {formatCurrency(opt.total)} (...
                          {opt.uuid.substring(32)})
                        </option>
                      ))}
                      {inv && (
                        <option value="none">
                          ❌ Desvincular factura (Dejar vacío)
                        </option>
                      )}
                    </select>
                    {inv && (
                      <div className="text-[10px] text-gray-400 flex justify-between items-center px-1">
                        <span className="font-mono">
                          UUID: ...{inv.uuid.substring(24)}
                        </span>
                        <span className="font-semibold text-gray-600">
                          Total: {formatCurrency(inv.total)}
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                {/* COLUMNA DIFERENCIA */}
                <td className="p-4 text-right font-mono font-bold align-middle">
                  <span
                    className={
                      status === "TOTAL_MATCH" ||
                      (status as string) === "MANUAL_MATCH"
                        ? "text-emerald-600"
                        : "text-amber-600 font-semibold"
                    }
                  >
                    {formatCurrency(diff)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
