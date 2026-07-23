import React from 'react';
import {
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Zap,
    Table,
    FileCheck2,
    ChevronRight
} from 'lucide-react';

import { ScrollytellingSection } from '../components/ScrollytellingSection';
import { TiltCard } from '../../../components/ui/TiltCard';
import { LogoMarquee } from '../components/LogoMarquee';

export const ConciliaFacilLanding: React.FC = () => {
    return (
        <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-indigo-500 selection:text-white">

            {/* =========================================================================
          Navegación / Header
         ========================================================================= */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-0 overflow-hidden -ml-2">
                        <img
                            src="/cf_logo.png"
                            alt="ConciliaFácil Logo"
                            className="h-12 w-auto object-contain -mr-6"
                        />
                        <span className="text-lg tracking-wide select-none whitespace-nowrap">
                            <span className="font-extrabold text-slate-100">Concilia</span>
                            <span className="font-semibold bg-linear-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Fácil</span>
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#demostracion" className="hover:text-slate-100 transition-colors">Cómo Funciona</a>
                        <a href="#caracteristicas" className="hover:text-slate-100 transition-colors">Funcionalidades</a>
                        <a href="#beneficios" className="hover:text-slate-100 transition-colors">Beneficios</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                            Iniciar Sesión
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-indigo-600/20">
                            Probar Gratis
                        </button>
                    </div>
                </div>
            </header>

             {/* =========================================================================
          SECCIÓN 1: Hero Section
         ========================================================================= */}
            <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden flex flex-col items-center text-center px-6">
                {/* Glow de fondo */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-medium text-indigo-400 mb-8 shadow-inner">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Conciliación Financiera Inteligente</span>
                </div>

                {/* Título Principal */}
                <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-[1.1] pb-2">
                    La conciliación bancaria, <br className="hidden sm:inline" />
                    en piloto automático.
                </h1>

                {/* Subtítulo */}
                <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
                    Olvídate del cruce manual de filas en Excel. Carga tus estados de cuenta, mapea columnas dinámicamente y detecta discrepancias en segundos.
                </p>

                {/* Botones de Acción */}
                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-base">
                        Empieza a Conciliar Gratis
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-6 py-3.5 rounded-xl border border-slate-800 transition-all text-base">
                        Ver Demo Interactiva
                    </button>
                </div>

                {/* Preview / Hero Mockup */}
                <div className="mt-16 w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl p-3 shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)]">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <span className="text-xs text-slate-500 font-mono">dashboard.conciliafacil.app</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                                <span className="text-xs text-slate-400">Total Transacciones</span>
                                <p className="text-xl font-bold text-white mt-1">1,420</p>
                            </div>
                            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                                <span className="text-xs text-emerald-400 font-medium">Conciliadas (98.5%)</span>
                                <p className="text-xl font-bold text-emerald-400 mt-1">1,399</p>
                            </div>
                            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                                <span className="text-xs text-amber-400 font-medium">Discrepancias</span>
                                <p className="text-xl font-bold text-amber-400 mt-1">21</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
          SECCIÓN 1.5: Marquesina de Compatibilidad Bancaria
         ========================================================================= */}
            <LogoMarquee />

            {/* =========================================================================
          SECCIÓN 2: Scrollytelling / Experiencia Tipo Video (300vh)
         ========================================================================= */}
            <ScrollytellingSection />

            {/* =========================================================================
          SECCIÓN 3: Bento Grid (Características Clave)
         ========================================================================= */}
            <section id="caracteristicas" className="py-24 px-6 bg-slate-950 border-t border-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-white/10 text-xs font-medium text-slate-400 mb-4">
                            Funcionalidades Clave
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent pb-1">Diseñado para la máxima precisión</h2>
                        <p className="mt-4 text-slate-400">Todo lo que necesitas para auditar y cruzar tus finanzas con total tranquilidad.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ perspective: '1000px' }}>

                        {/* Card Grande 1 */}
                        <TiltCard className="md:col-span-2">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                                <Table className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Mapeo Dinámico de Columnas</h3>
                            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                                Reconoce automáticamente campos clave como Fecha, Referencia, Concepto, Abonos y Cargos, adaptándose a cualquier banco sin configuraciones previas.
                            </p>
                        </TiltCard>

                        {/* Card Pequeña 2 */}
                        <TiltCard>
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Procesamiento Veloz</h3>
                            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                                Procesa miles de registros locales al instante con persistencia eficiente y cero demoras.
                            </p>
                        </TiltCard>

                        {/* Card Pequeña 3 */}
                        <TiltCard>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Detección de Discrepancias</h3>
                            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                                Identifica montos duplicados o faltantes y los resalta con códigos de color para auditoría inmediata.
                            </p>
                        </TiltCard>

                        {/* Card Grande 4 */}
                        <TiltCard className="md:col-span-2">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
                                <FileCheck2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Exportación de Reportes Claros</h3>
                            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                                Genera archivos consolidados en Excel o CSV listos para entregar a contabilidad o subir a tu sistema de gestión.
                            </p>
                        </TiltCard>

                    </div>
                </div>
            </section>

            {/* =========================================================================
          SECCIÓN 4: CTA Final
         ========================================================================= */}
            <section className="py-32 px-6 bg-slate-950 border-t border-slate-900 text-center relative overflow-hidden">
                {/* Ambient glows */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute left-1/4 bottom-0 w-[300px] h-[200px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-medium text-indigo-400 mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        Empieza hoy sin tarjeta de crédito
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent pb-2">
                        ¿Listo para simplificar tus conciliaciones?
                    </h2>
                    <p className="mt-4 text-slate-400 text-lg">
                        Empieza a optimizar tu flujo contable hoy mismo con ConciliaFácil.
                    </p>

                    {/* ── Métricas de Impacto ── */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-1 hover:border-indigo-500/30 transition-colors">
                            <span className="text-3xl font-extrabold bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">+100K</span>
                            <span className="text-xs text-slate-400 font-medium text-center leading-snug">Transacciones<br/>Conciliadas</span>
                        </div>
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-1 hover:border-emerald-500/30 transition-colors">
                            <span className="text-3xl font-extrabold bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent">99.9%</span>
                            <span className="text-xs text-slate-400 font-medium text-center leading-snug">Precisión del<br/>Algoritmo</span>
                        </div>
                        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-1 hover:border-purple-500/30 transition-colors">
                            <span className="text-3xl font-extrabold bg-gradient-to-b from-purple-300 to-purple-500 bg-clip-text text-transparent">&lt; 3s</span>
                            <span className="text-xs text-slate-400 font-medium text-center leading-snug">Por Archivo<br/>Procesado</span>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/25 transition-all text-base">
                            Comenzar Ahora Gratis
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold px-8 py-4 rounded-xl transition-all text-base">
                            Ver Demo en Vivo
                        </button>
                    </div>
                </div>
            </section>

            {/* =========================================================================
          Footer
         ========================================================================= */}
            <footer className="py-8 px-6 border-t border-white/5 bg-slate-950 text-xs text-slate-600 text-center">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-0 overflow-hidden">
                        <img
                            src="/cf_logo.png"
                            alt="ConciliaFácil Logo"
                            className="h-9 w-auto object-contain -mr-4"
                        />
                        <span className="text-sm tracking-wide select-none whitespace-nowrap">
                            <span className="font-extrabold text-slate-200">Concilia</span>
                            <span className="font-semibold bg-linear-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Fácil</span>
                        </span>
                        <p className="ml-4 border-l border-white/10 pl-4">© {new Date().getFullYear()} Todos los derechos reservados.</p>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-400 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-slate-400 transition-colors">Términos</a>
                        <a href="#" className="hover:text-slate-400 transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>

        </div>
    );
};