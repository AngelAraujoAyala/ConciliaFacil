// src/features/conciliation/components/ResultsTable.tsx
import { useState, useMemo } from "react";
import { useConciliationStore } from "../../../store/useConciliationStore";
import { useModalStore } from "../../../store/modalStore";
import FileDropzone from "./FileDropzone";
import { extractInvoicesXml } from "../utils/extractInvoicesXml";
import { useCreateConciliation } from "../hooks/useCreateConciliation";
import { useAuthStore } from "../../../store/authStore";
import type { CreateConciliationDto } from "../types/conciliation-payload";
import {
  countUniqueBankMovements,
  countUniqueInvoices,
  dedupeRemainingBankMovements,
  getConciliatedGroups,
  computeSuccessRate,
  countFullyConciliatedMovements,
  classifyMovements,
} from "../utils/bankMovementMetrics";

import SummaryCards from "./SummaryCards";
import GroupsTable from "./GroupsTable";
import ManualMatchPanel from "./ManualMatchPanel";
import ExceptionPanel from "./ExceptionPanel";

type TabType = "ALL" | "MATCHED" | "ISSUES" | "MANUAL" | "EXCEPTIONS";

export default function ResultsTable() {
  const user = useAuthStore((state) => state.user);

  const {
    matches,
    movements,
    invoices,
    remainingInvoices,
    remainingBankMovements,
    activeConciliationId,
    activeConciliationTitle,
    rfcEmpresaActual,
    hasMixedRfcsError,
    rerunConciliation,
    processInvoiceUpload,
    clearMixedRfcsError,
    approveGroupDiscrepancy,
    unmatchGroup,
  } = useConciliationStore();

  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [isAddingInvoices, setIsAddingInvoices] = useState(false);
  const [dropzoneFeedback, setDropzoneFeedback] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conciliationTitle, setConciliationTitle] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "DRAFT" | "COMPLETED" | null
  >(null);

  const { mutate, isPending: isSaving } = useCreateConciliation();

  const classifiedMovements = useMemo(
    () => classifyMovements(movements, matches),
    [movements, matches],
  );

  const summary = useMemo(() => {
    const totalBankMovements = countUniqueBankMovements(movements);
    const totalInvoices = countUniqueInvoices(invoices);
    const fullyConciliated = countFullyConciliatedMovements(matches);
    const reviewNeeded = matches.filter(
      (g) => g.status === "PARTIAL_MATCH" || g.status === "PENDING",
    ).length;

    return {
      totalBankMovements,
      totalInvoices,
      fullyConciliated,
      unreconciledBank: classifiedMovements.pendingReal.length,
      reviewNeeded,
      unreconciledInvoices: remainingInvoices.length,
      // successRate ahora incluye excepciones como movimientos resueltos
      successRate: computeSuccessRate(matches, totalBankMovements, movements),
    };
  }, [
    matches,
    movements,
    invoices,
    remainingInvoices,
    remainingBankMovements,
    classifiedMovements,
  ]);

  const hasSessionData =
    matches.length > 0 ||
    remainingInvoices.length > 0 ||
    remainingBankMovements.length > 0;

  const handleOpenSaveModal = (status: "DRAFT" | "COMPLETED") => {
    if (!hasSessionData) return;

    const defaultTitle =
      activeConciliationTitle ??
      `Conciliación - ${new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })}`;

    setConciliationTitle(defaultTitle);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!hasSessionData || !user || !selectedStatus || !conciliationTitle.trim())
      return;

    const conciliatedGroups = getConciliatedGroups(matches);
    const cleanRemainingBankMovements = dedupeRemainingBankMovements(
      matches,
      remainingBankMovements,
    );

    const payload: CreateConciliationDto & { status: "DRAFT" | "COMPLETED" } = {
      ...(activeConciliationId ? { id: activeConciliationId } : {}),
      title: conciliationTitle.trim(),
      status: selectedStatus,
      userId: user.id,
      rfcEmpresa: rfcEmpresaActual ?? "",
      successRate: summary.successRate,
      schemaVersion: 2,
      totalInvoices: countUniqueInvoices(invoices),
      totalBankMovements: countUniqueBankMovements(movements),
      matchedCount: conciliatedGroups.length,
      matches,
      movements,
      invoices,
      remainingInvoices,
      remainingBankMovements: cleanRemainingBankMovements,
    };

    mutate(payload);
    setIsModalOpen(false);
  };

  const handleIncrementalInvoicesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      setIsAddingInvoices(true);
      setDropzoneFeedback(null);
      clearMixedRfcsError();

      const extraction = await extractInvoicesXml(files);
      const result = processInvoiceUpload(extraction, { append: true });

      if (!result.success) {
        setDropzoneFeedback({
          msg: result.error ?? "Error al procesar XMLs.",
          type: "error",
        });
        return;
      }

      const addedCount = result.addedCount ?? 0;
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
      <SummaryCards summary={summary} />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-2">
        <div className="flex space-x-1 overflow-x-auto w-full lg:w-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all ${activeTab === "ALL" ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-450 dark:text-blue-400 font-bold bg-blue-50/20 dark:bg-blue-950/25" : "text-gray-500 dark:text-slate-405"}`}
          >
            Grupos ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("MATCHED")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all ${activeTab === "MATCHED" ? "border-b-2 border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-400 font-bold bg-emerald-50/20 dark:bg-emerald-950/25" : "text-gray-500 dark:text-slate-405"}`}
          >
            Cuadrado Perfecto ({summary.fullyConciliated})
          </button>
          <button
            onClick={() => setActiveTab("ISSUES")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all ${activeTab === "ISSUES" ? "border-b-2 border-amber-500 text-amber-600 dark:border-amber-450 dark:text-amber-400 font-bold bg-amber-50/20 dark:bg-amber-950/25" : "text-gray-500 dark:text-slate-405"}`}
          >
            Alertas ({summary.reviewNeeded})
          </button>
          <button
            onClick={() => setActiveTab("EXCEPTIONS")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all flex items-center gap-1.5 ${activeTab === "EXCEPTIONS" ? "border-b-2 border-rose-500 text-rose-600 dark:border-rose-450 dark:text-rose-400 font-bold bg-rose-50/20 dark:bg-rose-950/25" : "text-gray-500 dark:text-slate-405"}`}
          >
            🛡️ Excepciones
            {classifiedMovements.pendingReal.length > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                {classifiedMovements.pendingReal.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("MANUAL")}
            className={`px-4 py-2 text-xs font-medium rounded-t-xl transition-all ${activeTab === "MANUAL" ? "border-b-2 border-indigo-500 text-indigo-600 dark:border-indigo-450 dark:text-indigo-400 font-bold bg-indigo-50/20 dark:bg-indigo-950/25" : "text-gray-500 dark:text-slate-405"}`}
          >
            Conciliar ({summary.unreconciledBank + summary.unreconciledInvoices})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              useModalStore.getState().showConfirm({
                title: "Reiniciar Conciliación",
                message: "¿Seguro que deseas reiniciar la conciliación? Se volverá a ejecutar el motor de cruce automático y se limpiarán los ajustes manuales y excepciones, pero NO perderás los archivos cargados.",
                type: "danger",
                onConfirm: () => {
                  rerunConciliation();
                },
              });
            }}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-2 rounded-xl transition-colors cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
          >
            🔄 Reiniciar conciliación
          </button>

          <button
            onClick={() => handleOpenSaveModal("DRAFT")}
            disabled={isSaving || !hasSessionData}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold px-3 py-2 rounded-xl border border-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer dark:bg-amber-950/40 dark:hover:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50"
          >
            📁 Guardar progreso
          </button>

          <button
            onClick={() => handleOpenSaveModal("COMPLETED")}
            disabled={isSaving || !hasSessionData}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
          >
            {isSaving ? "⏳ Guardando..." : "✅ Marcar como completada"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-4">
        {activeTab === "MANUAL" ? (
          <ManualMatchPanel />
        ) : activeTab === "EXCEPTIONS" ? (
          <ExceptionPanel
            pendingMovements={classifiedMovements.pendingReal}
            exceptionMovements={classifiedMovements.exceptions}
            conciliationId={activeConciliationId}
          />
        ) : (
          <GroupsTable
            groups={matches}
            movements={movements}
            invoices={invoices}
            activeTab={activeTab}
            onApproveDiscrepancy={approveGroupDiscrepancy}
            onUnmatch={unmatchGroup}
          />
        )}
      </div>

      <div className="bg-gray-50 border border-dashed border-gray-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
              📥 ¿Encontraste las facturas que faltaban?
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-500">
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
            className={`px-4 py-2.5 rounded-xl text-xs font-medium flex justify-between items-center ${dropzoneFeedback.type === "success" ? "bg-emerald-50 border border-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-350" : "bg-amber-50 border border-amber-100 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-355"}`}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-1">
              {selectedStatus === "COMPLETED"
                ? "🔒 Finalizar y Cerrar Auditoría"
                : "📁 Guardar Progreso Actual"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-450 mb-4">
              {selectedStatus === "COMPLETED"
                ? "La sesión se guardará con estado cerrado para tu histórico contable permanente."
                : "Se creará un borrador editable para que puedas continuar ajustando los XMLs más tarde."}
            </p>

            <div className="space-y-1 mb-5">
              <label
                htmlFor="modal-title"
                className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Título de la conciliación
              </label>
              <input
                type="text"
                id="modal-title"
                value={conciliationTitle}
                onChange={(e) => setConciliationTitle(e.target.value)}
                placeholder="Ej. Conciliación Mensual Impuestos"
                className="w-full px-3 py-2 text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={!conciliationTitle.trim() || isSaving}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${selectedStatus === "COMPLETED"
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
