import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    FileSpreadsheet,
    Table,
    CheckCircle2,
    Sparkles,
    FileText
} from 'lucide-react';

export const ScrollytellingSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Rastrea el progreso del scroll dentro del contenedor de 300vh (0 a 1)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    // --- PASO 1 (Importación): 0% - 30% del scroll ---
    const opacityStep1 = useTransform(scrollYProgress, [0, 0.20, 0.30], [1, 1, 0]);
    const scaleStep1   = useTransform(scrollYProgress, [0, 0.20, 0.30], [1, 0.95, 0.88]);
    const yStep1       = useTransform(scrollYProgress, [0.22, 0.30],    [0, -40]);
    const displayStep1 = useTransform(scrollYProgress, (p) => (p < 0.31 ? 'flex' : 'none'));

    // --- PASO 2 (Mapeo Dinámico): 32% - 68% del scroll ---
    const opacityStep2 = useTransform(scrollYProgress, [0.32, 0.42, 0.60, 0.68], [0, 1, 1, 0]);
    const scaleStep2   = useTransform(scrollYProgress, [0.32, 0.42, 0.60, 0.68], [0.92, 1, 1, 0.92]);
    const yStep2       = useTransform(scrollYProgress, [0.32, 0.42],              [35, 0]);
    const displayStep2 = useTransform(scrollYProgress, (p) => (p >= 0.31 && p < 0.67 ? 'flex' : 'none'));

    // --- PASO 3 (Resultado / Conciliado): 68% - 100% del scroll ---
    const opacityStep3 = useTransform(scrollYProgress, [0.68, 0.78, 1],  [0, 1, 1]);
    const scaleStep3   = useTransform(scrollYProgress, [0.68, 0.78, 1],  [0.92, 1, 1]);
    const yStep3       = useTransform(scrollYProgress, [0.68, 0.78],     [35, 0]);
    const displayStep3 = useTransform(scrollYProgress, (p) => (p >= 0.67 ? 'flex' : 'none'));

    // Barra de progreso superior
    const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    return (
        <section id="demostracion" ref={containerRef} className="relative h-[300vh] bg-slate-950 border-t border-slate-900">

            {/* Contenedor Sticky (se queda congelado en la pantalla mientras bajas) */}
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6">

                {/* Encabezado Fijo */}
                <div className="text-center max-w-xl mb-8 z-10">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        Flujo Simplificado
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
                        Conciliación en tres pasos
                    </h2>
                </div>

                {/* Tarjeta Principal Interactivamente Animada */}
                <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden">

                    {/* Línea de Progreso Superior */}
                    <div className="h-1 bg-slate-800 w-full">
                        <motion.div
                            style={{ width: progressWidth }}
                            className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500"
                        />
                    </div>

                    <div className="p-6 sm:p-8">

                        {/* Indicadores de Paso Superiores */}
                        <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-800/80">
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-indigo-600/30">1</span>
                                <span className="text-sm font-semibold text-white">Importación</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center justify-center">2</span>
                                <span className="text-sm font-semibold text-slate-300">Mapeo Dinámico</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center">3</span>
                                <span className="text-sm font-semibold text-slate-300">Resultado</span>
                            </div>
                        </div>

                        {/* ═══════════════════════════════════════════════════════════════
                             ÁREA DE ESCENAS — CSS Grid Stacking
                             Todos los pasos comparten la misma celda de grid [1/1].
                             El contenedor hereda la altura del paso más alto (Paso 2).
                             No hay absolute/inset-0 → no hay colisión de layout.
                        ═══════════════════════════════════════════════════════════════ */}
                        <div className="grid w-full">

                            {/* ================= PASO 1 ================= */}
                            <motion.div
                                style={{ opacity: opacityStep1, scale: scaleStep1, y: yStep1, gridArea: '1/1', display: displayStep1 }}
                                className="flex flex-col items-center justify-center text-center px-4 py-6 pointer-events-none"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
                                    <FileSpreadsheet className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Importa tus archivos sin formato</h3>
                                <p className="text-sm text-slate-400 mt-2 max-w-md">
                                    Arrastra cualquier extracto en formato CSV o Excel. Cero plantillas previas ni transformaciones manuales.
                                </p>

                                {/* Mockup de Dropzone animado */}
                                <div className="mt-6 w-full max-w-md border-2 border-dashed border-indigo-500/30 rounded-xl p-5 bg-slate-950/60 flex items-center justify-center gap-3">
                                    <FileText className="w-5 h-5 text-indigo-400 animate-pulse" />
                                    <span className="text-xs text-slate-300 font-medium">estado_cuenta_bbva_julio.csv</span>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">Cargado</span>
                                </div>
                            </motion.div>

                            {/* ================= PASO 2 ================= */}
                            <motion.div
                                style={{ opacity: opacityStep2, scale: scaleStep2, y: yStep2, gridArea: '1/1', display: displayStep2 }}
                                className="flex flex-col items-center justify-center text-center px-4 py-6 pointer-events-none"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-inner">
                                    <Table className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Mapeo Dinámico de Columnas</h3>
                                <p className="text-sm text-slate-400 mt-1 max-w-md">
                                    Detector inteligente de estructura: asigna automáticamente Fecha, Monto, Referencia y Concepto.
                                </p>

                                {/* ── Archivo fuente ── */}
                                <div className="mt-4 w-full max-w-sm bg-slate-950/80 border border-purple-500/20 rounded-lg px-4 py-2.5 flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                    <span className="text-xs text-slate-300 font-mono truncate">estado_cuenta_bbva_julio.csv</span>
                                    <span className="ml-auto text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono shrink-0">3 cols</span>
                                </div>

                                {/* ── SVG Conectores Animados ── */}
                                <div className="w-full max-w-sm my-2">
                                    <svg
                                        viewBox="0 0 400 56"
                                        className="w-full"
                                        style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.45))' }}
                                    >
                                        <defs>
                                            <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                                                <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
                                                <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
                                            </linearGradient>
                                        </defs>

                                        <motion.path d="M 60 28 C 120 28, 120 12, 200 12 C 280 12, 280 12, 340 12"
                                            stroke="url(#connGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 1.1, delay: 0.1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
                                        />
                                        <motion.path d="M 60 28 C 130 28, 130 28, 200 28 C 270 28, 270 28, 340 28"
                                            stroke="url(#connGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 1.1, delay: 0.35, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
                                        />
                                        <motion.path d="M 60 28 C 120 28, 120 44, 200 44 C 280 44, 280 44, 340 44"
                                            stroke="url(#connGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 1.1, delay: 0.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
                                        />
                                        <motion.circle cx="60" cy="28" r="5" fill="#8b5cf6"
                                            initial={{ scale: 0 }} animate={{ scale: [1, 1.4, 1] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                        {[12, 28, 44].map((yPos, i) => (
                                            <motion.circle key={i} cx="340" cy={yPos} r="4" fill="#34d399"
                                                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3, delay: 0.9 + i * 0.15, repeat: Infinity, repeatDelay: 2.3 }}
                                            />
                                        ))}
                                    </svg>
                                </div>

                                {/* ── Columnas Detectadas ── */}
                                <div className="w-full max-w-sm grid grid-cols-3 gap-2 text-left">
                                    {[
                                        { label: 'Columna A', campo: 'Fecha', delay: '0s' },
                                        { label: 'Columna B', campo: 'Monto', delay: '0.2s' },
                                        { label: 'Columna C', campo: 'Ref.',  delay: '0.4s' },
                                    ].map(({ label, campo, delay }) => (
                                        <div key={campo} className="bg-slate-950/80 border border-purple-500/30 p-2.5 rounded-lg relative overflow-hidden">
                                            <span className="absolute inset-0 rounded-lg bg-purple-500/5 animate-pulse" style={{ animationDelay: delay }} />
                                            <span className="relative text-[10px] text-purple-400 font-mono block uppercase mb-1">{label}</span>
                                            <span className="relative text-xs font-semibold text-slate-200 block">{campo}</span>
                                            <span className="relative mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" style={{ animationDelay: delay }} />
                                                Detectado
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* ================= PASO 3 ================= */}
                            <motion.div
                                style={{ opacity: opacityStep3, scale: scaleStep3, y: yStep3, gridArea: '1/1', display: displayStep3 }}
                                className="flex flex-col items-center justify-center text-center px-4 py-6 pointer-events-none"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">¡100% Conciliado en Segundos!</h3>
                                <p className="text-sm text-slate-400 mt-2 max-w-md">
                                    Revisión completada sin errores humanos. Descarga tu reporte listo para auditar o guardar.
                                </p>

                                <div className="mt-6 w-full max-w-md bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                                        <span className="text-xs text-slate-300 font-medium">1,420 de 1,420 registros cruzados</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                        Sin discrepancias
                                    </span>
                                </div>
                            </motion.div>

                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};