import { Link } from "react-router-dom";

export default function AvisoPrivacidadPage() {
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
              Aviso de Privacidad
            </h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              Última actualización: 22 de julio de 2026
            </p>
          </div>

          {/* Intro */}
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            En <strong className="text-slate-800 dark:text-slate-200">ConciliaFácil</strong> nos tomamos muy en serio
            la privacidad de tus datos personales y financieros. Este Aviso detalla la información que recopilamos,
            cómo la tratamos y los mecanismos disponibles para ejercer tus derechos de acceso, rectificación,
            cancelación y oposición.
          </p>

          {/* Sección 1 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">1</span>
              Responsable del Tratamiento de Datos
            </h2>
            <p className="pl-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              El responsable del tratamiento de los datos es <strong className="text-slate-700 dark:text-slate-300">ConciliaFácil</strong>,
              que opera como una solución de software como servicio (SaaS). Para preguntas sobre tu privacidad,
              contáctanos a través de nuestro portal de soporte.
            </p>
          </section>

          {/* Sección 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">2</span>
              Datos Personales y Financieros que Recopilamos
            </h2>
            <div className="pl-4 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">A. Información de la Cuenta</h3>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-sm leading-relaxed list-disc list-inside">
                  <li><strong>Correo electrónico:</strong> Para autenticación, notificaciones del servicio y recuperación de cuenta.</li>
                  <li><strong>Identificadores técnicos:</strong> UUID de usuario generado automáticamente al registrarte.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">B. Datos de Facturación (vía Stripe)</h3>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-sm leading-relaxed list-disc list-inside">
                  <li>ID de cliente y suscripción, plan activo y estado del ciclo de facturación.</li>
                  <li><strong>ConciliaFácil no almacena números de tarjeta.</strong> Esto es gestionado directamente por Stripe bajo cumplimiento PCI-DSS.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">C. Datos Contables (Subidos por el Usuario)</h3>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-sm leading-relaxed list-disc list-inside">
                  <li><strong>Empresas:</strong> RFC y Razón Social de los contribuyentes registrados.</li>
                  <li><strong>Movimientos Bancarios:</strong> Fecha, descripción, monto y tipo de operación.</li>
                  <li><strong>Facturas XML (CFDI):</strong> UUID, fecha, RFC emisor/receptor, razón social y monto total.</li>
                  <li><strong>Grupos de conciliación:</strong> Las relaciones generadas entre movimientos y facturas emparejadas.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">3</span>
              Finalidad del Tratamiento
            </h2>
            <ul className="space-y-2 pl-4 text-slate-600 dark:text-slate-400 leading-relaxed text-sm list-decimal list-inside">
              <li>Ejecutar el motor de conciliación y pareo entre estados de cuenta bancarios y facturas XML.</li>
              <li>Almacenar el historial de conciliaciones completadas y borradores en curso.</li>
              <li>Administrar la suscripción y verificar los límites mensuales del plan contratado.</li>
              <li>Brindar soporte técnico personalizado y garantizar la seguridad de acceso a los datos.</li>
            </ul>
          </section>

          {/* Sección 4 — Badge destacado */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">4</span>
              No Comercializamos tus Datos
            </h2>
            <div className="pl-4 space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                <p>
                  <strong className="text-emerald-700 dark:text-emerald-300">Nunca vendemos ni rentamos tus datos.</strong>{" "}
                  Bajo ninguna circunstancia cedemos tus datos personales o financieros a terceros con fines publicitarios o comerciales.
                </p>
              </div>
              <p>
                Los datos solo se comparten con proveedores de infraestructura estrictamente necesarios (Supabase para
                base de datos y autenticación, Stripe para pagos), bajo rigurosas medidas de confidencialidad.
              </p>
            </div>
          </section>

          {/* Sección 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-black">5</span>
              Eliminación de Cuenta y Registros (Derechos ARCO)
            </h2>
            <div className="pl-4 space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              <p>
                Puedes solicitar la eliminación completa e irreversible de tu cuenta desde{" "}
                <strong className="text-slate-700 dark:text-slate-300">Configuración → Perfil</strong> en la plataforma.
                Al ejecutar esta acción, se eliminan permanentemente en cascada:
              </p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li>Tu registro de usuario y credenciales de autenticación.</li>
                <li>Tus datos de perfil y preferencias de interfaz.</li>
                <li>Todas las empresas y RFCs registrados.</li>
                <li>La totalidad del historial de conciliaciones: borradores, movimientos bancarios y facturas asociadas.</li>
              </ul>
            </div>
          </section>

          {/* Footer del documento */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              ¿Tienes dudas sobre tu privacidad?{" "}
              <Link to="/home/soporte" className="underline hover:text-slate-600 dark:hover:text-slate-300">
                Contáctanos aquí.
              </Link>
            </p>
            <Link
              to="/legal/terminos"
              className="text-xs text-indigo-600 dark:text-indigo-400 underline hover:opacity-80"
            >
              Ver Términos y Condiciones →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
