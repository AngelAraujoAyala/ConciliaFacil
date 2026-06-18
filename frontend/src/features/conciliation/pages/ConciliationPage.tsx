import BankUploadStep from "../components/BankUploadStep";
import InvoiceUploadStep from "../components/InvoiceUploadStep";
import ResultsTable from "../components/ResultsTable";
import { useConciliationStore } from "../../../store/useConciliationStore";

export default function ConciliationPage() {
  // Consumimos solo lo necesario para el flujo de la pagina
  const currentStep = useConciliationStore((state) => state.currentStep);
  const setCurrentStep = useConciliationStore((state) => state.setCurrentStep);
  const movements = useConciliationStore((state) => state.movements);
  const setMovements = useConciliationStore((state) => state.setMovements);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Encabezado Dinámico */}
      <header className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Módulo de Conciliación
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentStep === "BANK_UPLOAD" &&
              "Paso 1: Carga el estado de cuenta bancario (.csv, .xlsx)"}
            {currentStep === "INVOICE_UPLOAD" &&
              "Paso 2: Carga la carpeta de facturas XML del SAT"}
            {currentStep === "RESULTS" && "Resultados y Auditoría de Cuentas"}
          </p>
        </div>

        {/* Indicadores Visuales de Progreso */}
        <div className="flex items-center space-x-2 text-xs font-medium">
          <span
            className={`px-2.5 py-1 rounded-full ${currentStep === "BANK_UPLOAD" ? "bg-blue-100 text-blue-700 font-bold" : "bg-gray-100 text-gray-400"}`}
          >
            1. Banco
          </span>
          <span className="text-gray-300">➔</span>
          <span
            className={`px-2.5 py-1 rounded-full ${currentStep === "INVOICE_UPLOAD" ? "bg-blue-100 text-blue-700 font-bold" : "bg-gray-100 text-gray-400"}`}
          >
            2. Facturas
          </span>
          <span className="text-gray-300">➔</span>
          <span
            className={`px-2.5 py-1 rounded-full ${currentStep === "RESULTS" ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-gray-100 text-gray-400"}`}
          >
            3. Resultados
          </span>
        </div>
      </header>

      {/* Renderizado Condicional de Pasos */}
      {currentStep === "BANK_UPLOAD" && (
        <BankUploadStep
          movements={movements}
          onMovementsParsed={setMovements}
          onNextStep={() => setCurrentStep("INVOICE_UPLOAD")}
        />
      )}

      {currentStep === "INVOICE_UPLOAD" && <InvoiceUploadStep />}

      {currentStep === "RESULTS" && <ResultsTable />}
    </div>
  );
}
