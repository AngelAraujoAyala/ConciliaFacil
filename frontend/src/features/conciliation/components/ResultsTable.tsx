import { useState, useMemo } from "react";
import { useConciliationStore } from "../../../store/useConciliationStore";
import FileDropzone from "./FileDropzone";
import { extractInvoicesXml } from "../utils/extractInvoicesXml";
import type { InvoiceXML } from "../../../types";

type TabType = "ALL" | "MATCHED" | "ISSUES" | "UNMATCHED_INVOICES";

export default function ResultsTable() {
  // 🧠 CONEXIÓN AL STORE GLOBAL
  const matches = useConciliationStore((state) => state.matches);
  const unmatchedInvoices = useConciliationStore(
    (state) => state.remainingInvoices,
  );
  const reset = useConciliationStore((state) => state.reset);
  const addIncrementalInvoices = useConciliationStore(
    (state) => state.addIncrementalInvoices,
  );

  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [isAddingInvoices, setIsAddingInvoices] = useState(false);
  const [dropzoneFeedback, setDropzoneFeedback] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // 🧮 RECALCULAR ESTADÍSTICAS BASADAS EN EL ESTADO REAL (STATUS)
  const summary = useMemo(() => {
    const totalBankMovements = matches.length;

    // Ahora consideramos válidos tanto el Match Perfecto como el Aprobado Manualmente
    const fullyConciliated = matches.filter(
      (m) =>
        m.status === "TOTAL_MATCH" || (m.status as string) === "MANUAL_MATCH",
    ).length;

    const unreconciledBank = matches.filter(
      (m) => m.status === "NO_MATCH",
    ).length;
    const reviewNeeded = matches.filter(
      (m) => m.status === "MULTIPLE_MATCHES",
    ).length;

    return {
      totalBankMovements,
      totalInvoices:
        matches.filter((m) => m.matchedInvoice).length +
        unmatchedInvoices.length,
      fullyConciliated,
      unreconciledBank,
      reviewNeeded,
      unreconciledInvoices: unmatchedInvoices.length,
      successRate:
        totalBankMovements > 0
          ? Math.round((fullyConciliated / totalBankMovements) * 100)
          : 0,
    };
  }, [matches, unmatchedInvoices]);

  // ⚡ MANEJADOR PARA FORZAR/APROBAR DESFASE MANUALMENTE
  const handleApproveDiscrepancy = (matchId: string) => {
    const updatedMatches = matches.map((m) => {
      if (m.id !== matchId) return m;
      const diff = m.matchedInvoice
        ? m.bankMovement.amount - m.matchedInvoice.total
        : 0;

      return {
        ...m,
        status: "MANUAL_MATCH" as any,
        observations: `Desfase de ${formatCurrency(diff)} aprobado manualmente por el usuario.`,
      };
    });

    useConciliationStore.setState({ matches: updatedMatches });
  };

  // 🔄 MANEJADOR DE ASIGNACIÓN MANUAL DESDE SELECTOR
  const handleManualAssign = (matchId: string, selectedInvoiceId: string) => {
    const currentMatch = matches.find((m) => m.id === matchId);
    if (!currentMatch) return;

    const previousInvoice = currentMatch.matchedInvoice;
    let newInvoice: InvoiceXML | null = null;
    let updatedUnmatched = [...unmatchedInvoices];

    if (previousInvoice) {
      updatedUnmatched.push(previousInvoice);
    }

    if (selectedInvoiceId !== "none") {
      const found = updatedUnmatched.find(
        (inv) => inv.id === selectedInvoiceId,
      );
      if (found) {
        newInvoice = found;
        updatedUnmatched = updatedUnmatched.filter(
          (inv) => inv.id !== selectedInvoiceId,
        );
      }
    }

    const updatedMatches = matches.map((m) => {
      if (m.id !== matchId) return m;

      let newStatus: "TOTAL_MATCH" | "NO_MATCH" | "MULTIPLE_MATCHES" =
        "NO_MATCH";
      let obs = "Asignado manualmente por el usuario.";

      if (newInvoice) {
        const exactAmount =
          Math.abs(m.bankMovement.amount - newInvoice.total) < 0.01;
        // Si el usuario cambia la factura, vuelve a calcular de forma limpia el estado inicial
        newStatus = exactAmount ? "TOTAL_MATCH" : "MULTIPLE_MATCHES";
        if (!exactAmount) obs = `Match manual con diferencia de pesos.`;
      } else {
        obs = "Sin factura vinculada.";
      }

      return {
        ...m,
        matchedInvoice: newInvoice,
        status: newStatus,
        observations: obs,
      };
    });

    useConciliationStore.setState({
      matches: updatedMatches,
      remainingInvoices: updatedUnmatched,
    });
  };

  // 📥 MANEJADOR DROPZONE INCREMENTAL
  const handleIncrementalInvoicesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      setIsAddingInvoices(true);
      setDropzoneFeedback(null);

      const parsedInvoices = await extractInvoicesXml(files);
      if (parsedInvoices.length === 0) {
        throw new Error("No se encontraron XMLs válidos en la selección.");
      }

      const { addedCount } = addIncrementalInvoices(parsedInvoices);

      if (addedCount > 0) {
        setDropzoneFeedback({
          msg: `¡Éxito! Se inyectaron ${addedCount} facturas nuevas al pool de forma incremental.`,
          type: "success",
        });
      } else {
        setDropzoneFeedback({
          msg: "Todas las facturas arrastradas ya existían en el sistema (Duplicados omitidos).",
          type: "error",
        });
      }
    } catch (err) {
      setDropzoneFeedback({
        msg: err instanceof Error ? err.message : "Error al procesar los XMLs.",
        type: "error",
      });
    } finally {
      setIsAddingInvoices(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* 📊 PANEL DE KPIs */}
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

      {/* 🎛️ PESTAÑAS DE FILTRADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-1">
        <div className="flex space-x-1 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl ${activeTab === "ALL" ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/20" : "text-gray-500"}`}
          >
            Todos ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("MATCHED")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl ${activeTab === "MATCHED" ? "border-b-2 border-emerald-600 text-emerald-600 font-bold bg-emerald-50/20" : "text-gray-500"}`}
          >
            Cuadrado Perfecto ({summary.fullyConciliated})
          </button>
          <button
            onClick={() => setActiveTab("ISSUES")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl ${activeTab === "ISSUES" ? "border-b-2 border-amber-500 text-amber-600 font-bold bg-amber-50/20" : "text-gray-500"}`}
          >
            Alertas / Pendientes (
            {summary.unreconciledBank + summary.reviewNeeded})
          </button>
          <button
            onClick={() => setActiveTab("UNMATCHED_INVOICES")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl ${activeTab === "UNMATCHED_INVOICES" ? "border-b-2 border-purple-500 text-purple-600 font-bold bg-purple-50/20" : "text-gray-500"}`}
          >
            Facturas Huérfanas ({unmatchedInvoices.length})
          </button>
        </div>
        <button
          onClick={reset}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          🔄 Nueva Conciliación
        </button>
      </div>

      {/* 📋 CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {activeTab === "UNMATCHED_INVOICES" ? (
          /* ================= VISTA: FACTURAS HUÉRFANAS ================= */
          <div className="overflow-x-auto">
            {unmatchedInvoices.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No hay facturas huérfanas libres.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50 text-[11px] text-gray-400 font-bold uppercase">
                  <tr>
                    <th className="p-4">Fecha Factura</th>
                    <th className="p-4">UUID Breve</th>
                    <th className="p-4">Contribuyente</th>
                    <th className="p-4 text-right">Total Factura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {unmatchedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-purple-50/10">
                      <td className="p-4 font-mono text-gray-500">
                        {inv.date}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-gray-400 block">
                          ...{inv.uuid.substring(24)}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${inv.type === "INGRESO" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                        >
                          {inv.type}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-700">
                        {inv.type === "INGRESO"
                          ? inv.nameReceptor
                          : inv.nameEmisor}
                      </td>
                      <td className="p-4 text-right font-bold text-gray-800">
                        {formatCurrency(inv.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          /* ================= VISTA: TABLA EN ESPEJO ================= */
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
                {matches
                  .filter((m) => {
                    if (activeTab === "MATCHED") {
                      return (
                        m.status === "TOTAL_MATCH" ||
                        (m.status as string) === "MANUAL_MATCH"
                      );
                    }
                    if (activeTab === "ISSUES") {
                      return (
                        m.status === "NO_MATCH" ||
                        m.status === "MULTIPLE_MATCHES"
                      );
                    }
                    return true;
                  })
                  .map((match) => {
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
                        {/* BANCO */}
                        <td className="p-4 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-gray-400">
                              {bm.date}
                            </span>
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

                        {/* BADGE INTERACTIVO DE ESTADO */}
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
                                  🟡 Desfase menor
                                </span>
                                <button
                                  onClick={() =>
                                    handleApproveDiscrepancy(match.id)
                                  }
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

                        {/* SELECTOR INTERACTIVO */}
                        <td className="p-4 align-middle">
                          <div className="space-y-2 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                            <select
                              value={inv ? inv.id : "none"}
                              onChange={(e) =>
                                handleManualAssign(match.id, e.target.value)
                              }
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

                        {/* DIFERENCIA */}
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
        )}
      </div>

      {/* 📥 SECCIÓN INCREMENTAL: DROPZONE DE CONTINGENCIA */}
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 space-y-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              📥 ¿Encontraste las facturas que faltaban?
            </h3>
            <p className="text-xs text-gray-400">
              Arrastra nuevos archivos XML aquí. Se añadirán al vuelo sin
              alterar tus cruces ni recargar la página.
            </p>
          </div>
          {isAddingInvoices && (
            <span className="text-xs text-blue-600 font-medium animate-pulse">
              Procesando y de-duplicando...
            </span>
          )}
        </div>

        <FileDropzone
          title="Agregar XMLs Adicionales"
          description="Sueltas tus comprobantes faltantes para rellenar los huecos rojos"
          accept=".xml"
          multiple={true}
          icon="➕"
          onFilesSelected={handleIncrementalInvoicesSelected}
        />

        {dropzoneFeedback && (
          <div
            className={`px-4 py-2.5 rounded-xl text-xs font-medium flex justify-between items-center ${
              dropzoneFeedback.type === "success"
                ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
                : "bg-amber-50 border border-amber-100 text-amber-800"
            }`}
          >
            <span>{dropzoneFeedback.msg}</span>
            <button
              onClick={() => setDropzoneFeedback(null)}
              className="text-[10px] underline font-bold opacity-80 hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
