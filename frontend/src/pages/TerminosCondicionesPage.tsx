import { Link } from "react-router-dom";

export default function TerminosCondicionesPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans">
      {/* Header navegación */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <span>⚡</span>
            <span>ConciliaFácil</span>
          </Link>
          <Link
            to="/home"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            ← Volver
          </Link>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-8 md:p-12 space-y-8">
          {/* Título */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Documento legal
            </p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
              Términos y Condiciones del Servicio
            </h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              Última actualización: 22 de julio de 2026
            </p>
          </div>

          {/* Intro */}
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Los siguientes Términos y Condiciones del Servicio (en adelante, los{" "}
            <strong className="text-slate-800 dark:text-slate-200">"Términos"</strong>) rigen el uso del software y la
            plataforma web <strong className="text-slate-800 dark:text-slate-200">ConciliaFácil</strong> (en adelante,
            el "Servicio", la "Plataforma" o "ConciliaFácil"). Al crear una cuenta y/o utilizar nuestros servicios
            de conciliación, aceptas de forma expresa e incondicional obligarte por estos Términos. Si no estás
            de acuerdo con alguna de las cláusulas, deberás abstenerte de utilizar la Plataforma.
          </p>

          {/* Sección 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">1</span>
              Naturaleza del Servicio y Deslinde de Responsabilidad Profesional
            </h2>
            <ul className="space-y-3 pl-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Herramienta de Soporte Tecnológico:</strong>{" "}
                ConciliaFácil es una herramienta tecnológica basada en software diseñada exclusivamente para
                asistir, automatizar y agilizar el proceso de comparación y conciliación de movimientos bancarios
                frente a facturas XML.
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">No es Asesoría Contable ni Fiscal:</strong>{" "}
                ConciliaFácil <strong>no es un despacho contable, no presta servicios de asesoría fiscal ni
                  consultoría financiera personalizada</strong>. El uso de la herramienta no constituye en ningún
                caso una auditoría oficial dictaminada.
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Responsabilidad del Usuario:</strong>{" "}
                La interpretación, validación final de la información y la presentación de declaraciones ante el
                SAT u otras autoridades fiscales es responsabilidad exclusiva del usuario o de su asesor contable.
                ConciliaFácil no se hace responsable de discrepancias fiscales, multas o recargos resultantes
                de una incorrecta configuración o interpretación de los datos procesados.
              </li>
            </ul>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">2</span>
              Suscripción, Planes y Límites de Uso
            </h2>
            <ul className="space-y-3 pl-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Planes de Servicio:</strong>{" "}
                El acceso a la Plataforma se rige por diferentes planes (Plan Gratis, Plan Básico, Plan Pro) con
                límites cuantitativos de conciliaciones y RFCs por mes.
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Actualizaciones y Facturación (Stripe):</strong>{" "}
                Las suscripciones premium son procesadas a través del sistema seguro de cobros recurrentes de Stripe.
                Las cancelaciones o modificaciones se aplican al final del período de facturación actual.
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Uso Adecuado de la Plataforma:</strong>{" "}
                Está estrictamente prohibido intentar evadir los límites del plan, realizar ataques contra la
                infraestructura o cargar datos maliciosos. ConciliaFácil se reserva el derecho de suspender o
                cancelar cuentas que infrinjan estos Términos.
              </li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">3</span>
              Disponibilidad del Servicio y Limitación de Responsabilidad
            </h2>
            <ul className="space-y-3 pl-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Disponibilidad de Nivel MVP:</strong>{" "}
                ConciliaFácil se ofrece bajo un modelo de esfuerzo comercialmente razonable (best-effort). No
                garantizamos la disponibilidad ininterrumpida de la plataforma ni la ausencia total de errores.
              </li>
              <li>
                <strong className="text-slate-700 dark:text-slate-300">Límite de Daños:</strong>{" "}
                ConciliaFácil no será responsable de ningún daño indirecto, incidental o consecuente,
                incluyendo pérdida de ganancias, datos o pérdidas financieras derivadas de interrupciones del servicio.
              </li>
            </ul>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">4</span>
              Propiedad Intelectual
            </h2>
            <p className="pl-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Todos los derechos sobre el software, códigos fuente, diseños visuales, algoritmos de coincidencia,
              marcas registradas, logotipos e interfaces gráficas de ConciliaFácil son de propiedad intelectual
              exclusiva de los creadores de la Plataforma.
            </p>
          </section>

          {/* Footer del documento */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              ¿Tienes dudas sobre estos términos?{" "}
              <Link to="/home/soporte" className="underline hover:text-slate-600 dark:hover:text-slate-300">
                Contáctanos aquí.
              </Link>
            </p>
            <Link
              to="/legal/privacidad"
              className="text-xs text-indigo-600 dark:text-indigo-400 underline hover:opacity-80"
            >
              Ver Aviso de Privacidad →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
