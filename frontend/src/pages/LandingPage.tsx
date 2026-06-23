import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">
      {/* HERO SECTION: El primer impacto visual y corporativo */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700">
              ⚡ Procesamiento Local de Próxima Generación
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              Concilia miles de movimientos bancarios en{" "}
              <span className="text-indigo-600">segundos</span>.
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
              La única herramienta web inteligente optimizada para despachos
              contables que automatiza el cruce de estados de cuenta contra
              facturas XML **sin almacenar datos financieros en servidores
              externos**.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-center shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base"
              >
                Comenzar Conciliación Gratis 🚀
              </Link>
              <a
                href="#como-funciona"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-8 py-4 rounded-xl text-center transition-all text-base border border-slate-200"
              >
                Ver cómo funciona
              </a>
            </div>
          </div>

          {/* MOCKUP INTERACTIVO SIMULADO: Resalta la complejidad visualmente */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-blue-600 rounded-2xl blur opacity-15"></div>
            <div className="relative bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-4 text-left font-mono text-xs text-slate-400">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                </div>
                <span className="text-[10px] text-slate-500 font-sans font-medium">
                  Algoritmo de Cruce v1.2
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/50 flex justify-between items-center">
                  <span className="text-emerald-400">✔ DEPS_NÓMINA_2812</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    MATCH PERFECTO
                  </span>
                </div>
                <div className="p-2 rounded bg-amber-950/40 border border-amber-900/50 flex justify-between items-center">
                  <span className="text-amber-400">⚠ PAGO_PROV_0106_DIF</span>
                  <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    DESFASE FECHA
                  </span>
                </div>
                <div className="p-2 rounded bg-rose-950/40 border border-rose-900/50 flex justify-between items-center">
                  <span className="text-rose-400">✘ COMIS_BANC_MENSUAL</span>
                  <span className="bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    SIN FACTURA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE DATOS / PILARES: Genera confianza inmediata */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-xs">
              <p className="text-3xl font-black text-slate-900">0%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Almacenamiento en Servidor
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Los archivos financieros nunca salen de tu navegador web
                corporativo.
              </p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-xs">
              <p className="text-3xl font-black text-indigo-600">&lt; 3s</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Tiempo de Procesamiento
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Algoritmo síncrono capaz de mapear más de 5,000 registros al
                vuelo.
              </p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-xs">
              <p className="text-3xl font-black text-slate-900">3 Niveles</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Clasificación Automatizada
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Detección inmediata mediante auditoría de semáforo visual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS TÉCNICAS: Demuestra el poder de la app */}
      <section className="py-20 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-600">
              Complejidad bajo el capó
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900">
              Diseñado para la contabilidad moderna
            </p>
            <p className="text-base text-slate-500">
              Un software robusto estructurado para erradicar las ineficiencias
              del Excel manual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tarjeta 1 */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 hover:shadow-md transition-all space-y-3 text-left">
              <span className="text-2xl">⚙️</span>
              <h3 className="font-bold text-slate-900 text-lg">
                Mapeador Dinámico Universal
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Olvídate de las plantillas fijas por banco. Nuestra interfaz
                interactiva te permite mapear columnas con clics sobre una vista
                previa en tiempo real.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 hover:shadow-md transition-all space-y-3 text-left">
              <span className="text-2xl">🛡️</span>
              <h3 className="font-bold text-slate-900 text-lg">
                Privacidad Blindada por Omisión
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Aprovechamos las APIs nativas del cliente para procesar los
                datos directamente en memoria RAM. Ideal para auditorías
                confidenciales exigentes.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 hover:shadow-md transition-all space-y-3 text-left">
              <span className="text-2xl">🚦</span>
              <h3 className="font-bold text-slate-900 text-lg">
                Auditoría Visual de Semáforo
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visualización instantánea en verde para coincidencias exactas,
                amarillo para desajustes marginales de fechas o montos, y rojo
                para discrepancias fiscales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN MUESTRA EL FLUJO (CÓMO FUNCIONA) */}
      <section id="como-funciona" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900">
              Conciliación fluida en 3 simples pasos
            </h2>
            <p className="text-sm text-slate-500">
              Un flujo secuencial óptimo diseñado para eliminar la fricción
              analítica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="space-y-2 text-left bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                PASO 01
              </span>
              <h4 className="font-bold text-slate-900 pt-1">
                Carga el Estado Bancario
              </h4>
              <p className="text-xs text-slate-500">
                Arrastra tu documento Excel o CSV sin importar el orden original
                del banco.
              </p>
            </div>
            <div className="space-y-2 text-left bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                PASO 02
              </span>
              <h4 className="font-bold text-slate-900 pt-1">
                Mapea Visualmente
              </h4>
              <p className="text-xs text-slate-500">
                Haz clic sobre los encabezados para indicarle al motor la fecha,
                el monto y el concepto.
              </p>
            </div>
            <div className="space-y-2 text-left bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                PASO 03
              </span>
              <h4 className="font-bold text-slate-900 pt-1">
                Cruza con Facturas XML
              </h4>
              <p className="text-xs text-slate-500">
                Suelta tus archivos CFDI para disparar la comparación
                algorítmica tricolor en tiempo real.
              </p>
            </div>
          </div>

          <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/50 p-4 rounded-r-lg max-w-3xl mx-auto text-sm text-indigo-900 italic font-medium text-left">
            "Diseñado bajo arquitecturas de procesamiento en el cliente,
            garantizando confidencialidad legal absoluta frente al SAT y
            normativas de protección de datos de terceros."
          </blockquote>
        </div>
      </section>

      {/* FINAL CTA: El cierre de venta */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-linear(circle_at_top_right,var(--tw-linear-stops))] from-indigo-950 via-slate-900 to-slate-950 opacity-70"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            ¿Listo para recuperar tu tiempo de auditoría?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Prueba el poder de procesamiento de ConciliaFácil hoy mismo. Sin
            registros obligatorios para evaluar el potencial.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl transition-all text-base transform hover:-translate-y-0.5"
            >
              Iniciar Ejecución Inmediata ➔
            </Link>
          </div>
        </div>
      </section>

      {/* CORPORATE FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 font-medium">
        <p>
          © 2026 ConciliaFácil. Todos los derechos reservados. Procesamiento
          local verificado.
        </p>
      </footer>
    </div>
  );
}
