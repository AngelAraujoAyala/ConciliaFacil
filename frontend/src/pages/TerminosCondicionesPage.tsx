import { Link } from "react-router-dom";
import { FileText, ShieldCheck } from "lucide-react";

export default function TerminosCondicionesPage() {
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
              <FileText className="w-3.5 h-3.5" />
              Documento legal
            </p>
            <h1 className="text-3xl font-black text-white">
              Términos y Condiciones del Servicio
            </h1>
            <p className="mt-2 text-xs text-slate-500">
              Última actualización: 22 de julio de 2026
            </p>
          </div>

          {/* Intro */}
          <p className="text-slate-400 leading-relaxed text-sm">
            Los siguientes Términos y Condiciones del Servicio (en adelante, los <strong className="text-slate-200">"Términos"</strong>) rigen el uso del software y la plataforma web <strong className="text-slate-200">ConciliaFácil</strong> (en adelante, el "Servicio", la "Plataforma" o "ConciliaFácil"). Al crear una cuenta y/o utilizar nuestros servicios de conciliación, aceptas de forma expresa e incondicional obligarte por estos Términos. Si no estás de acuerdo con alguna de las cláusulas, deberás abstenerte de utilizar la Plataforma.
          </p>

          {/* Sección 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">1</span>
              Naturaleza del Servicio y Deslinde de Responsabilidad
            </h2>
            <ul className="space-y-3 pl-8 text-slate-400 text-sm leading-relaxed list-disc list-outside">
              <li>
                <strong className="text-slate-300">Herramienta de Soporte Tecnológico:</strong> ConciliaFácil es una herramienta tecnológica basada en software diseñada exclusivamente para asistir y agilizar el proceso de comparación y conciliación de movimientos bancarios frente a facturas XML.
              </li>
              <li>
                <strong className="text-slate-300">No es Asesoría Contable ni Fiscal:</strong> ConciliaFácil <strong className="text-slate-200">no es un despacho contable, no presta servicios de asesoría fiscal ni consultoría financiera personalizada</strong>. El uso de la herramienta no constituye en ningún caso una auditoría oficial dictaminada.
              </li>
              <li>
                <strong className="text-slate-300">Responsabilidad del Usuario:</strong> La interpretación, validación final de la información y la presentación de declaraciones ante el SAT es responsabilidad exclusiva del usuario. ConciliaFácil no se hace responsable de discrepancias fiscales, multas o recargos.
              </li>
            </ul>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">2</span>
              Suscripción, Planes y Límites de Uso
            </h2>
            <ul className="space-y-3 pl-8 text-slate-400 text-sm leading-relaxed list-disc list-outside">
              <li>
                <strong className="text-slate-300">Planes de Servicio:</strong> El acceso a la Plataforma se rige por diferentes planes con límites cuantitativos de conciliaciones y RFCs por mes.
              </li>
              <li>
                <strong className="text-slate-300">Facturación (Stripe):</strong> Las suscripciones premium son procesadas a través de Stripe. Las cancelaciones se aplican al final del período de facturación actual de forma automática.
              </li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">3</span>
              Propiedad Intelectual e Industrial
            </h2>
            <p className="pl-8 text-slate-400 text-sm leading-relaxed">
              Todos los componentes lógicos del sistema, código fuente, logotipos, interfaces de usuario, animaciones, marcas comerciales y nombres de dominio asociados son propiedad exclusiva de ConciliaFácil. Queda prohibida la reproducción, ingeniería inversa o copia sin autorización expresa.
            </p>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black">4</span>
              Modificaciones a los Términos
            </h2>
            <p className="pl-8 text-slate-400 text-sm leading-relaxed">
              Nos reservamos el derecho de modificar o actualizar estos Términos en cualquier momento. La continuación en el uso de la Plataforma tras la publicación de los cambios constituye la aceptación expresa de las nuevas condiciones.
            </p>
          </section>

          {/* Cierre */}
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
              Documento oficial de términos y condiciones ConciliaFácil
            </span>
            <Link to="/legal/privacidad" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Leer Aviso de Privacidad →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
