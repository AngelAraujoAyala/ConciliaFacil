import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '../../../api/supabase';

type PageState = 'loading' | 'form' | 'success' | 'invalid';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [pageState, setPageState] = useState<PageState>('loading');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Supabase processes the recovery token from the URL hash automatically.
    // We listen for the PASSWORD_RECOVERY event to know when it's safe to show the form.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setPageState('form');
            } else if (event === 'SIGNED_IN' && pageState === 'form') {
                // Already handled
            }
        });

        // Fallback: if there's already a session with recovery context
        const timeout = setTimeout(() => {
            setPageState((prev) => (prev === 'loading' ? 'invalid' : prev));
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsSubmitting(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setIsSubmitting(false);

        if (updateError) {
            setError(updateError.message);
        } else {
            setPageState('success');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-indigo-600/10 blur-[120px]" />
            </div>

            <AnimatePresence mode="wait">
                {pageState === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                    >
                        <div className="mx-auto h-10 w-10 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin mb-4" />
                        <p className="text-sm text-slate-400">Verificando enlace...</p>
                    </motion.div>
                )}

                {pageState === 'invalid' && (
                    <motion.div
                        key="invalid"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-sm"
                    >
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                            <KeyRound className="h-7 w-7" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Enlace inválido</h2>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                            El enlace de recuperación expiró o ya fue utilizado. Solicita uno nuevo.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all cursor-pointer"
                        >
                            Volver al inicio
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}

                {pageState === 'form' && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative z-10 w-full max-w-97.5 rounded-2xl border border-white/10 bg-slate-900/90 px-7 py-8 shadow-2xl backdrop-blur-2xl text-slate-100"
                    >
                        {/* Logo */}
                        <div className="flex justify-center mb-5">
                            <img src="/cf_logo.png" alt="ConciliaFácil" className="h-10 w-auto object-contain" />
                        </div>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
                                <KeyRound className="h-6 w-6" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">Nueva contraseña</h1>
                            <p className="text-[11px] text-slate-400 mt-1">Elige una contraseña segura para tu cuenta</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-[11px] text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* New password */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-300">Nueva contraseña</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoFocus
                                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-300">Confirmar contraseña</label>
                                <div className="relative">
                                    <input
                                        name="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="Repite tu contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                                    >
                                        {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmitting ? 'Actualizando...' : 'Establecer nueva contraseña'}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </form>
                    </motion.div>
                )}

                {pageState === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative z-10 w-full max-w-97.5 rounded-2xl border border-white/10 bg-slate-900/90 px-7 py-10 shadow-2xl backdrop-blur-2xl text-center text-slate-100"
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-5">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">¡Contraseña actualizada!</h2>
                        <p className="text-[11px] text-slate-400 mb-8 leading-relaxed">
                            Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                        >
                            Ir a iniciar sesión
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
