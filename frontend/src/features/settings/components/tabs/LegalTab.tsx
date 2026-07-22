import React from "react";
import { FileText, ShieldAlert, KeyRound } from "lucide-react";

export const LegalTab: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Legal y Privacidad
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Consulta las bases legales y los derechos sobre tus datos e información en ConciliaFácil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Card Términos */}
        <a
          href="/legal/terminos"
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-5 rounded-xl border border-slate-200 hover:border-indigo-500 dark:border-slate-800 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-950 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Términos y Condiciones
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Reglas de uso de la plataforma, licencias y deslindes.
              </p>
            </div>
          </div>
        </a>

        {/* Card Privacidad */}
        <a
          href="/legal/privacidad"
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-5 rounded-xl border border-slate-200 hover:border-indigo-500 dark:border-slate-800 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-950 dark:text-slate-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Aviso de Privacidad
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cómo tratamos, protegemos y eliminamos tus datos personales.
              </p>
            </div>
          </div>
        </a>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <KeyRound size={16} className="text-slate-400" />
          Tus derechos (ARCO) y control de datos
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          En ConciliaFácil te garantizamos control absoluto sobre tus datos. Tienes derecho a solicitar el Acceso,
          Rectificación, Cancelación u Oposición al tratamiento de tu información contable y personal.
        </p>
        <div className="text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-lg leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">¿Deseas revocar el consentimiento o eliminar tus datos?</strong>
          <p className="mt-1">
            Puedes realizarlo de forma inmediata borrando tu cuenta desde la pestaña{" "}
            <span className="font-semibold text-red-600 dark:text-red-400">"Eliminar cuenta"</span> en este panel.
            Esto iniciará la purga irreversible de tus credenciales, empresas registradas e historial de conciliaciones
            de nuestra infraestructura en la nube.
          </p>
        </div>
      </div>
    </section>
  );
};
