import { useNavigate } from "react-router-dom";
import BankUploadStep from "../components/BankUploadStep";
import InvoiceUploadStep from "../components/InvoiceUploadStep";
import ResultsTable from "../components/ResultsTable";
import { useConciliationStore } from "../../../store/useConciliationStore";
import { useGetProfile } from "../../dashboard/hooks/useGetProfile";

export default function ConciliationPage() {
  const navigate = useNavigate();

  // Consumimos el perfil del usuario de base de datos
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();

  // Consumimos solo lo necesario para el flujo de la pagina
  const currentStep = useConciliationStore((state) => state.currentStep);
  const setCurrentStep = useConciliationStore((state) => state.setCurrentStep);
  const movements = useConciliationStore((state) => state.movements);
  const setMovements = useConciliationStore((state) => state.setMovements);

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <p className="text-gray-500 dark:text-slate-400 text-sm animate-pulse">Cargando información del perfil...</p>
      </div>
    );
  }

  // Interceptar si el usuario FREE ya supero el limite mensual de 3 conciliaciones
  if (profile && profile.plan === "FREE" && profile.monthlyConciliations >= 3) {
    const nextReset = new Date(profile.nextResetDate);
    const diffTime = nextReset.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeftText = diffDays > 0 ? ` (faltan ${diffDays} día${diffDays === 1 ? "" : "s"})` : "";

    return (
      <div className="max-w-xl mx-auto p-4 my-10">
        {/* Paywall Premium Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Top decorative gradient bar */}
          <div className="h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600"></div>

          <div className="p-8 flex flex-col items-center text-center space-y-6">
            {/* Lock Icon Wrapper with Micro-animation */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 animate-bounce">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping"></span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 relative z-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v-6.75a2.25 2.25 0 002.25-2.25z"
                />
              </svg>
            </div>

            {/* Content block */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                Has alcanzado el límite de tu Plan Gratis
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Para mantener ConciliaFácil accesible y justo, el plan gratuito incluye hasta 3 conciliaciones al mes.
                Puedes esperar al próximo periodo de reinicio o mejorar tu plan ahora mismo para obtener conciliaciones ilimitadas.
              </p>
            </div>

            {/* Date Indicator Badge */}
            <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs px-4 py-2.5 rounded-lg font-semibold inline-flex items-center space-x-1.5 border border-indigo-100 dark:border-indigo-900/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <span>
                Tu contador se reiniciará el: {nextReset.toLocaleDateString()}{daysLeftText}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <button
                onClick={() => navigate("/home/planes")}
                className="flex-1 py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl shadow-md transition duration-200"
              >
                Mejorar Plan
              </button>
              <button
                onClick={() => navigate("/home")}
                className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-gray-300 dark:border-slate-650 transition duration-200"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Encabezado Dinámico */}
      <header className="border-b border-gray-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            Módulo de Conciliación
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {currentStep === "BANK_UPLOAD" &&
              "Paso 1: Carga el estado de cuenta bancario (.csv, .xlsx)"}
            {currentStep === "INVOICE_UPLOAD" &&
              "Paso 2: Carga la carpeta de facturas XML del SAT"}
            {currentStep === "RESULTS" && "Resultados de Conciliación de Cuentas"}
          </p>
        </div>

        {/* Indicadores Visuales de Progreso */}
        <div className="flex items-center space-x-3 text-xs font-medium">
          {/* Paso 1: Banco */}
          <div className="flex items-center space-x-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full border text-[10px] transition-all duration-200 ${
                currentStep === "INVOICE_UPLOAD" || currentStep === "RESULTS"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                  : currentStep === "BANK_UPLOAD"
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-100 dark:ring-blue-900/30"
                    : "bg-transparent border-gray-300 dark:border-slate-700 text-gray-400 dark:text-slate-500"
              }`}
            >
              {currentStep === "INVOICE_UPLOAD" || currentStep === "RESULTS" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                "1"
              )}
            </span>
            <span
              className={`${
                currentStep === "BANK_UPLOAD"
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : currentStep === "INVOICE_UPLOAD" || currentStep === "RESULTS"
                    ? "text-gray-800 dark:text-slate-200"
                    : "text-gray-400 dark:text-slate-500"
              }`}
            >
              Banco
            </span>
          </div>

          <span className="text-gray-300 dark:text-slate-700">➔</span>

          {/* Paso 2: Facturas */}
          <div className="flex items-center space-x-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full border text-[10px] transition-all duration-200 ${
                currentStep === "RESULTS"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                  : currentStep === "INVOICE_UPLOAD"
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-100 dark:ring-blue-900/30"
                    : "bg-transparent border-gray-300 dark:border-slate-700 text-gray-400 dark:text-slate-500"
              }`}
            >
              {currentStep === "RESULTS" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                "2"
              )}
            </span>
            <span
              className={`${
                currentStep === "INVOICE_UPLOAD"
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : currentStep === "RESULTS"
                    ? "text-gray-800 dark:text-slate-200"
                    : "text-gray-400 dark:text-slate-500"
              }`}
            >
              Facturas
            </span>
          </div>

          <span className="text-gray-300 dark:text-slate-700">➔</span>

          {/* Paso 3: Resultados */}
          <div className="flex items-center space-x-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full border text-[10px] transition-all duration-200 ${
                currentStep === "RESULTS"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold ring-2 ring-emerald-100 dark:ring-emerald-900/30 shadow-xs"
                  : "bg-transparent border-gray-300 dark:border-slate-700 text-gray-400 dark:text-slate-500"
              }`}
            >
              3
            </span>
            <span
              className={`${
                currentStep === "RESULTS"
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-gray-400 dark:text-slate-500"
              }`}
            >
              Resultados
            </span>
          </div>
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
