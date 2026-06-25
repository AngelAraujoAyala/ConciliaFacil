// src/features/conciliation/components/ResultsTable.tsx
import { useState, useMemo } from "react";
import { useConciliationStore } from "../../../store/useConciliationStore";
import FileDropzone from "./FileDropzone";
import { extractInvoicesXml } from "../utils/extractInvoicesXml";
import type { InvoiceXML } from "../../../types";
import { useCreateConciliation } from "../hooks/useCreateConciliation";
import { useAuthStore } from "../../../store/authStore";
import type { CreateConciliationDto } from "../types/conciliation-payload";

// Componentes extraídos atomizados
import SummaryCards from "./SummaryCards";
import UnmatchedInvoicesTable from "./UnmatchedInvoicesTable";
import MatchesTable from "./MatchesTable";

type TabType = "ALL" | "MATCHED" | "ISSUES" | "UNMATCHED_INVOICES";

export default function ResultsTable() {
  const user = useAuthStore((state) => state.user);
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

  // 📝 Estados locales para el modal de persistencia y títulos personalizados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conciliationTitle, setConciliationTitle] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "DRAFT" | "COMPLETED" | null
  >(null);

  // Inyectamos la mutación de TanStack Query
  const { mutate, isPending: isSaving } = useCreateConciliation();

  // 🧮 KPIs reactivos heredados
  const summary = useMemo(() => {
    const totalBankMovements = matches.length;
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

  // 🛠️ Control de flujo: Preparar modal y pre-llenar título sugerido
  const handleOpenSaveModal = (status: "DRAFT" | "COMPLETED") => {
    if (matches.length === 0) return;

    const defaultTitle = `Conciliación - ${new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })}`;

    setConciliationTitle(defaultTitle);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  // 💾 Confirmación final desde el modal hacia el Backend
  const handleConfirmSave = () => {
    if (
      matches.length === 0 ||
      !user ||
      !selectedStatus ||
      !conciliationTitle.trim()
    )
      return;

    const payload: CreateConciliationDto & { status: "DRAFT" | "COMPLETED" } = {
      title: conciliationTitle.trim(),
      status: selectedStatus,
      userId: user.id,
      successRate: summary.successRate,
      totalInvoices: matches.length + summary.unreconciledInvoices,
      totalBankMovements: matches.length + summary.unreconciledBank,
      matchedCount: matches.filter((m) => !!m.matchedInvoice).length,
      matches: matches,
      remainingInvoices: unmatchedInvoices,
      remainingBankMovements: [],
    };

    mutate(payload);
    setIsModalOpen(false);
  };

  // ⚡ EVENTO: APROBACIÓN MANUAL
  const handleApproveDiscrepancy = (matchId: string) => {
    const updatedMatches = matches.map((m) => {
      if (m.id !== matchId) return m;
      const diff = m.matchedInvoice
        ? m.bankMovement.amount - m.matchedInvoice.total
        : 0;
      return {
        ...m,
        status: "MANUAL_MATCH" as any,
        observations: `Desfase de ${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(diff)} aprobado manualmente.`,
      };
    });
    useConciliationStore.setState({ matches: updatedMatches });
  };

  // 🔄 EVENTO: REASIGNACIÓN MANUAL DESDE SELECTOR
  const handleManualAssign = (matchId: string, selectedInvoiceId: string) => {
    const currentMatch = matches.find((m) => m.id === matchId);
    if (!currentMatch) return;

    const previousInvoice = currentMatch.matchedInvoice;
    let newInvoice: InvoiceXML | null = null;
    let updatedUnmatched = [...unmatchedInvoices];

    if (previousInvoice) updatedUnmatched.push(previousInvoice);

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

  // 📥 EVENTO: DROPZONE INCREMENTAL
  const handleIncrementalInvoicesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      setIsAddingInvoices(true);
      setDropzoneFeedback(null);
      const parsedInvoices = await extractInvoicesXml(files);
      if (parsedInvoices.length === 0)
        throw new Error("No se encontraron XMLs válidos.");

      const { addedCount } = addIncrementalInvoices(parsedInvoices);
      setDropzoneFeedback({
        msg:
          addedCount > 0
            ? `Se inyectaron ${addedCount} facturas nuevas.`
            : "Todas las facturas ya existían.",
        type: addedCount > 0 ? "success" : "error",
      });
    } catch (err) {
      setDropzoneFeedback({
        msg: err instanceof Error ? err.message : "Error al procesar XMLs.",
        type: "error",
      });
    } finally {
      setIsAddingInvoices(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 📊 PANEL DE KPIs */}
      <SummaryCards summary={summary} />

      {/* 🎛️ PESTAÑAS Y ACCIONES DE CABECERA */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200 pb-2">
        <div className="flex space-x-1 overflow-x-auto w-full lg:w-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all ${activeTab === "ALL" ? "border-b-2 border-blue-600 text-blue-600 font-bold bg-blue-50/20" : "text-gray-500"}`}
          >
            Todos ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("MATCHED")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all ${activeTab === "MATCHED" ? "border-b-2 border-emerald-600 text-emerald-600 font-bold bg-emerald-50/20" : "text-gray-500"}`}
          >
            Cuadrado Perfecto ({summary.fullyConciliated})
          </button>
          <button
            onClick={() => setActiveTab("ISSUES")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all ${activeTab === "ISSUES" ? "border-b-2 border-amber-500 text-amber-600 font-bold bg-amber-50/20" : "text-gray-500"}`}
          >
            Alertas ({summary.unreconciledBank + summary.reviewNeeded})
          </button>
          <button
            onClick={() => setActiveTab("UNMATCHED_INVOICES")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all ${activeTab === "UNMATCHED_INVOICES" ? "border-b-2 border-purple-500 text-purple-600 font-bold bg-purple-50/20" : "text-gray-500"}`}
          >
            Facturas Huérfanas ({unmatchedInvoices.length})
          </button>
        </div>

        {/* 🎛️ BOTONERA PROFESIONAL */}
        <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (
                confirm(
                  "¿Seguro que deseas limpiar la sesión actual? Se borrarán todos los cruces actuales.",
                )
              ) {
                reset();
              }
            }}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            🔄 Reiniciar conciliación
          </button>

          <button
            onClick={() => handleOpenSaveModal("DRAFT")}
            disabled={isSaving || matches.length === 0}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold px-3 py-2 rounded-xl border border-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            📁 Guardar progreso
          </button>

          <button
            onClick={() => handleOpenSaveModal("COMPLETED")}
            disabled={isSaving || matches.length === 0}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
          >
            {isSaving ? "⏳ Guardando..." : "✅ Marcar como completada"}
          </button>
        </div>
      </div>

      {/* 📋 CONTENEDOR DE TABLAS PRINCIPALES */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {activeTab === "UNMATCHED_INVOICES" ? (
          <UnmatchedInvoicesTable unmatchedInvoices={unmatchedInvoices} />
        ) : (
          <MatchesTable
            matches={matches}
            unmatchedInvoices={unmatchedInvoices}
            activeTab={activeTab}
            onApproveDiscrepancy={handleApproveDiscrepancy}
            onManualAssign={handleManualAssign}
          />
        )}
      </div>

      {/* 📥 SECCIÓN INCREMENTAL */}
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 space-y-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              📥 ¿Encontraste las facturas que faltaban?
            </h3>
            <p className="text-xs text-gray-400">
              Arrastra nuevos archivos XML aquí. Se añadirán al vuelo sin
              alterar tus cruces.
            </p>
          </div>
          {isAddingInvoices && (
            <span className="text-xs text-blue-600 font-medium animate-pulse">
              Procesando...
            </span>
          )}
        </div>

        <FileDropzone
          title="Agregar XMLs Adicionales"
          description="Sueltas tus comprobantes"
          accept=".xml"
          multiple={true}
          icon="➕"
          onFilesSelected={handleIncrementalInvoicesSelected}
        />

        {dropzoneFeedback && (
          <div
            className={`px-4 py-2.5 rounded-xl text-xs font-medium flex justify-between items-center ${dropzoneFeedback.type === "success" ? "bg-emerald-50 border border-emerald-100 text-emerald-800" : "bg-amber-50 border border-amber-100 text-amber-800"}`}
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

      {/* 🗺️ MODAL DE PERSISTENCIA (TAILWIND UI CON BACKDROP BLUR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {selectedStatus === "COMPLETED"
                ? "🔒 Finalizar y Cerrar Auditoría"
                : "📁 Guardar Progreso Actual"}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {selectedStatus === "COMPLETED"
                ? "La sesión se guardará con estado cerrado para tu histórico contable permanente."
                : "Se creará un borrador editable para que puedas continuar ajustando los XMLs más tarde."}
            </p>

            <div className="space-y-1 mb-5">
              <label
                htmlFor="modal-title"
                className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                Título de la conciliación
              </label>
              <input
                type="text"
                id="modal-title"
                value={conciliationTitle}
                onChange={(e) => setConciliationTitle(e.target.value)}
                placeholder="Ej. Conciliación Mensual Impuestos"
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={!conciliationTitle.trim() || isSaving}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
                  selectedStatus === "COMPLETED"
                    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    : "bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300"
                }`}
              >
                {isSaving ? "Guardando..." : "Confirmar y Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
