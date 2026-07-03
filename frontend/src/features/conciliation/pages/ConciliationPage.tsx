import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BankUploadStep from "../components/BankUploadStep";
import InvoiceUploadStep from "../components/InvoiceUploadStep";
import ResultsTable from "../components/ResultsTable";
import { useConciliationStore } from "../../../store/useConciliationStore";
import { useGetProfile } from "../../dashboard/hooks/useGetProfile";

export default function ConciliationPage() {
  const navigate = useNavigate();
  const [showPaywallModal, setShowPaywallModal] = useState(false);

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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm animate-pulse">Cargando información del perfil...</p>
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Top decorative gradient bar */}
          <div className="h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600"></div>

          <div className="p-8 flex flex-col items-center text-center space-y-6">
            {/* Lock Icon Wrapper with Micro-animation */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 animate-bounce">
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
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Has alcanzado el límite de tu Plan Gratis
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                Para mantener ConciliaFácil accesible y justo, el plan gratuito incluye hasta 3 conciliaciones al mes.
                Puedes esperar al próximo periodo de reinicio o mejorar tu plan ahora mismo para obtener conciliaciones ilimitadas.
              </p>
            </div>

            {/* Date Indicator Badge */}
            <div className="bg-indigo-50 text-indigo-700 text-xs px-4 py-2.5 rounded-lg font-semibold inline-flex items-center space-x-1.5 border border-indigo-100">
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
                onClick={() => setShowPaywallModal(true)}
                className="flex-1 py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl shadow-md transition duration-200"
              >
                Mejorar Plan
              </button>
              <button
                onClick={() => navigate("/home")}
                className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-300 transition duration-200"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Modal "Próximamente" */}
        {showPaywallModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100 transform scale-100 transition-transform">
              <div className="flex items-center space-x-3 text-amber-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <h3 className="font-bold text-lg text-gray-900">Mejorar Plan (Próximamente)</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Estamos preparando las pasarelas de pago y opciones de suscripción para darte la mejor experiencia.
                ¡Gracias por tu interés en potenciar tus conciliaciones con nosotros! Te avisaremos muy pronto.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPaywallModal(false)}
                  className="py-2 px-5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition duration-150"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
