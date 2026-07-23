import { Link } from "react-router-dom";
import { Shield, ShieldCheck } from "lucide-react";

export default function AvisoPrivacidadPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans">
      {/* Header navegación */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-900 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-0 overflow-hidden -ml-2 select-none"
          >
            <img
              src="/cf_logo.png"
              alt="ConciliaFácil Logo"
              className="h-10 w-auto object-contain -mr-4"
            />
            <span className="text-base tracking-wide whitespace-nowrap">
              <span className="font-extrabold text-slate-200">Concilia</span>
              <span className="font-semibold bg-linear-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Fácil</span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/5 p-8 md:p-12 space-y-8 shadow-2xl">
          {/* Título */}
          <div className="border-b border-white/5 pb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Documento legal
            </p>
            <h1 className="text-3xl font-black text-white">
              Aviso de Privacidad
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Última actualización: 22 de julio de 2026
            </p>
          </div>

          {/* Intro */}
          <p className="text-slate-400 leading-relaxed text-sm">
            En <strong className="text-slate-200">ConciliaFácil</strong> nos tomamos muy en serio
            la privacidad de tus datos personales y financieros. Este Aviso detalla la información que recopilamos,
            cómo la tratamos y los mecanismos disponibles para ejercer tus derechos de acceso, rectificación,
            cancelación y oposición.
          </p>

          {/* Sección 1 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">1</span>
              Responsable del Tratamiento de Datos
            </h2>
            <p className="pl-8 text-slate-400 text-sm leading-relaxed">
              El responsable del tratamiento de los datos es <strong className="text-slate-300">ConciliaFácil</strong>,
              que opera como una solución de software como servicio (SaaS). Para preguntas sobre tu privacidad,
              contáctanos a través de nuestro correo oficial de soporte.
            </p>
          </section>

          {/* Sección 2 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">2</span>
              Datos Personales y Financieros que Recopilamos
            </h2>
            <div className="pl-8 space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-slate-300 mb-1 text-xs uppercase tracking-wider">A. Información de la Cuenta</h3>
                <ul className="space-y-1 text-slate-400 leading-relaxed list-disc list-inside">
                  <li><strong>Correo electrónico:</strong> Para autenticación, notificaciones del servicio y recuperación de cuenta.</li>
                  <li><strong>Identificadores técnicos:</strong> UUID de usuario generado automáticamente al registrarte.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-300 mb-1 text-xs uppercase tracking-wider">B. Datos de Facturación (vía Stripe)</h3>
                <ul className="space-y-1 text-slate-400 leading-relaxed list-disc list-inside">
                  <li>ID de cliente y suscripción, plan activo y estado del ciclo de facturación.</li>
                  <li><strong>ConciliaFácil no almacena números de tarjeta.</strong> Esto es gestionado directamente por Stripe bajo cumplimiento PCI-DSS.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-300 mb-1 text-xs uppercase tracking-wider">C. Datos Contables (Subidos por el Usuario)</h3>
                <ul className="space-y-1 text-slate-400 leading-relaxed list-disc list-inside">
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
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">3</span>
              Finalidad del Tratamiento
            </h2>
            <p className="pl-8 text-slate-400 text-sm leading-relaxed">
              Tratamos los datos contables y bancarios con el fin exclusivo de prestarte el servicio de conciliación
              automática, generar tus reportes de auditoría y mejorar nuestros algoritmos de detección inteligente.
              Tus archivos financieros subidos nunca son leídos por humanos salvo que lo solicites explícitamente para soporte.
            </p>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">4</span>
              Seguridad de la Información
            </h2>
            <p className="pl-8 text-slate-400 text-sm leading-relaxed">
              Implementamos protocolos HTTPS con TLS 1.3 de extremo a extremo. Los datos contables y documentos subidos
              son almacenados bajo estricto control de acceso autenticado a nivel de base de datos.
            </p>
          </section>

          {/* Sección 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">5</span>
              Derechos ARCO
            </h2>
            <p className="pl-8 text-slate-400 text-sm leading-relaxed">
              Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación u Oposición enviando una solicitud por
              correo electrónico a nuestro soporte oficial. También puedes borrar tu cuenta e historial directamente
              desde el panel de configuración de la plataforma en cualquier momento.
            </p>
          </section>

          {/* Cierre */}
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
              Documento oficial de privacidad ConciliaFácil
            </span>
            <Link to="/legal/terminos" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Leer Términos de Servicio →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
