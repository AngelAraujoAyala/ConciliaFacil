import { useState } from "react";
import FileDropzone from "./FileDropzone";
import { extractInvoicesXml } from "../utils/extractInvoicesXml";
import { useConciliationStore } from "../../../store/useConciliationStore";

export default function InvoiceUploadStep() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoices = useConciliationStore((state) => state.invoices);
  const hasMixedRfcsError = useConciliationStore((state) => state.hasMixedRfcsError);
  const rfcEmpresaActual = useConciliationStore((state) => state.rfcEmpresaActual);
  const processInvoiceUpload = useConciliationStore((state) => state.processInvoiceUpload);
  const clearMixedRfcsError = useConciliationStore((state) => state.clearMixedRfcsError);
  const setInvoices = useConciliationStore((state) => state.setInvoices);
  const setCurrentStep = useConciliationStore((state) => state.setCurrentStep);
  const runConciliation = useConciliationStore((state) => state.runConciliation);

  const handleInvoiceFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);
      clearMixedRfcsError();

      const extraction = await extractInvoicesXml(files);
      const result = processInvoiceUpload(extraction, { append: invoices.length > 0 });

      if (!result.success) {
        setError(result.error ?? "Error al procesar los archivos XML.");
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al procesar los archivos XML.",
      );
    } finally {
      setIsLoading(false);
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
      <FileDropzone
        title="Carpeta de Facturas (CFDI)"
        description="Arrastra múltiples archivos .xml o la carpeta completa del mes"
        accept=".xml"
        multiple={true}
        icon="📁"
        onFilesSelected={handleInvoiceFilesSelected}
      />

      {/* Botón de volver al Paso 1 siempre visible debajo de la zona de drop */}
      <div className="flex justify-start">
        <button
          onClick={() => setCurrentStep("BANK_UPLOAD")}
          className="inline-flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-slate-350 hover:text-gray-900 dark:hover:text-white bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 px-4 py-2 rounded-xl border border-gray-200/60 dark:border-slate-700/60 transition-all duration-200 shadow-xs"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Volver a Paso 1: Movimientos Bancarios</span>
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-4 text-sm text-blue-600 animate-pulse font-medium">
          Leyendo y validando XMLs del SAT...
        </div>
      )}

      {hasMixedRfcsError && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300 px-4 py-3 rounded-xl text-sm flex justify-between items-start gap-3">
          <div>
            <p className="font-semibold">RFCs mixtos detectados</p>
            <p className="mt-1">
              El lote contiene facturas de empresas distintas. Carga únicamente XMLs
              del mismo contribuyente para continuar con la conciliación.
            </p>
          </div>
          <button
            onClick={clearMixedRfcsError}
            className="text-xs font-bold underline shrink-0"
          >
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs font-bold underline ml-2"
          >
            Cerrar
          </button>
        </div>
      )}

      {invoices.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-slate-350">
                Facturas Listas ({invoices.length})
              </h2>
              {rfcEmpresaActual && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  RFC empresa detectado:{" "}
                  <span className="font-mono font-medium text-gray-700 dark:text-slate-300">
                    {rfcEmpresaActual}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={() => setInvoices([])}
              className="text-xs text-red-500 hover:underline"
            >
              Limpiar facturas
            </button>
          </div>

          <div className="bg-white border border-gray-200 divide-y divide-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:divide-slate-800 rounded-xl shadow-sm max-h-87.5 overflow-y-auto custom-scrollbar">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-mono text-gray-400 dark:text-slate-500">
                    {inv.date} • UUID: ...{inv.uuid.substring(24)}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                    {inv.type === "INGRESO"
                      ? `Cliente: ${inv.nameReceptor}`
                      : `Proveedor: ${inv.nameEmisor}`}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 ${
                    inv.type === "INGRESO" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(inv.total)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={runConciliation}
              disabled={hasMixedRfcsError}
              className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚡ Ejecutar Conciliación Inteligente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
