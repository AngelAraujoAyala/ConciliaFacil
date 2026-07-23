import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MailOpen, RefreshCw, ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, SendHorizonal } from 'lucide-react';
import { useLoginMutation } from '../hooks/useLoginMutation';
import { useRegisterMutation } from '../hooks/useRegisterMutation';
import { useForgotPasswordMutation } from '../hooks/useForgotPasswordMutation';
import { supabase } from '../../../api/supabase';
import GoogleButton from './GoogleButton';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'login' | 'register';
}

type ActiveView = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    initialTab = 'login',
}) => {
    const [activeTab, setActiveTab] = useState<ActiveView>(initialTab);
    const [forgotSent, setForgotSent] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Register success states
    const [isRegistered, setIsRegistered] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [timeLeft, setTimeLeft] = useState(300);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Mutations
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation();
    const forgotMutation = useForgotPasswordMutation();
    const [validationError, setValidationError] = useState<string | null>(null);

    // Reset states when opening/closing
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setIsRegistered(false);
            setForgotSent(false);
            setForgotEmail('');
            setValidationError(null);
            loginMutation.reset();
            registerMutation.reset();
            forgotMutation.reset();
        }
    }, [isOpen, initialTab]);

    // Timer for registration code verification
    useEffect(() => {
        if (!isRegistered || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [isRegistered, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Form handlers
    const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidationError(null);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            setValidationError('Por favor completa todos los campos.');
            return;
        }
        loginMutation.mutate({ email, password });
    };

    const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidationError(null);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!email || !password || !confirmPassword) {
            setValidationError('Todos los campos son obligatorios.');
            return;
        }
        if (password.length < 6) {
            setValidationError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setValidationError('Las contraseñas no coinciden.');
            return;
        }

        registerMutation.mutate(
            { email, password },
            {
                onSuccess: () => {
                    setRegisteredEmail(email);
                    setTimeLeft(300);
                    setIsRegistered(true);
                },
            }
        );
    };

    const handleForgotSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidationError(null);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('forgotEmail') as string;
        if (!email) {
            setValidationError('Ingresa tu correo electrónico.');
            return;
        }
        forgotMutation.mutate(email, {
            onSuccess: () => {
                setForgotEmail(email);
                setForgotSent(true);
            },
        });
    };

    const handleResendEmail = async () => {
        if (isResending) return;
        setIsResending(true);
        setResendMessage(null);

        const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: registeredEmail,
            options: {
                emailRedirectTo: `${siteUrl}/auth/callback`,
            },
        });

        setIsResending(false);
        if (error) {
            setResendMessage({ type: 'error', text: `Error: ${error.message}` });
        } else {
            setResendMessage({ type: 'success', text: '¡Enlace reenviado! Revisa tu bandeja.' });
            setTimeLeft(300);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
                    />

                    {/* Modal container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="relative z-10 w-full max-w-97.5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 px-6 py-6 shadow-2xl backdrop-blur-2xl text-slate-100"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {activeTab === 'forgot' ? (
                            /* ══════ FORGOT PASSWORD VIEW ══════ */
                            <div className="py-2">
                                {!forgotSent ? (
                                    <>
                                        {/* Header */}
                                        <div className="text-center mb-5">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
                                                <KeyRound className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-bold tracking-tight text-white">Recupera tu contraseña</h3>
                                            <p className="text-[11px] text-slate-400 mt-1">Te enviaremos un enlace para restablecerla</p>
                                        </div>

                                        {/* Error */}
                                        {(validationError || forgotMutation.error) && (
                                            <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-[11px] text-red-400">
                                                {validationError || forgotMutation.error?.message}
                                            </div>
                                        )}

                                        <form onSubmit={handleForgotSubmit} className="space-y-3">
                                            <div className="space-y-1 text-left">
                                                <label className="text-[11px] font-semibold text-slate-300">Correo Electrónico</label>
                                                <input
                                                    name="forgotEmail"
                                                    type="email"
                                                    required
                                                    autoFocus
                                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                    placeholder="contador@empresa.com"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={forgotMutation.isPending}
                                                className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                            >
                                                {forgotMutation.isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
                                                <SendHorizonal className="h-3.5 w-3.5" />
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    /* Success state */
                                    <div className="text-center py-3">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
                                            <MailOpen className="h-7 w-7" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">¡Revisa tu correo!</h3>
                                        <p className="text-[11px] text-slate-400 mb-1 leading-relaxed">
                                            Enviamos un enlace de recuperación a:
                                        </p>
                                        <p className="text-xs font-semibold text-white mb-5">{forgotEmail}</p>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-5 text-left">
                                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                                💡 Si no ves el correo en tu bandeja, revisa la carpeta de <span className="text-slate-300 font-semibold">spam o correo no deseado</span>.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Back to login */}
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => { setActiveTab('login'); setForgotSent(false); forgotMutation.reset(); setValidationError(null); }}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group cursor-pointer"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
                                        Volver al inicio de sesión
                                    </button>
                                </div>
                            </div>
                        ) : !isRegistered ? (
                            <>
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <div className="flex justify-center mb-2">
                                        <img
                                            src="/cf_logo.png"
                                            alt="ConciliaFácil Logo"
                                            className="h-11 w-auto object-contain"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                                        {activeTab === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {activeTab === 'login'
                                            ? 'Automatiza tu conciliación contable hoy'
                                            : 'Comienza en segundos sin tarjeta'}
                                    </p>
                                </div>

                                {/* Tabs selector */}
                                <div className="flex bg-white/5 p-1 rounded-lg mb-4 relative">
                                    <button
                                        onClick={() => { setActiveTab('login'); setValidationError(null); }}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all z-10 cursor-pointer ${activeTab === 'login' ? 'text-white bg-indigo-600 shadow' : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        Iniciar Sesión
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('register'); setValidationError(null); }}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all z-10 cursor-pointer ${activeTab === 'register' ? 'text-white bg-indigo-600 shadow' : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        Registrarse
                                    </button>
                                </div>

                                <GoogleButton />

                                {/* Errors */}
                                {(validationError || loginMutation.error || registerMutation.error) && (
                                    <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-[11px] text-red-400">
                                        {validationError || loginMutation.error?.message || registerMutation.error?.message}
                                    </div>
                                )}

                                {/* Login View */}
                                {activeTab === 'login' && (
                                    <form onSubmit={handleLoginSubmit} className="space-y-3">
                                        <div className="space-y-1 text-left">
                                            <label className="text-[11px] font-semibold text-slate-300">Correo Electrónico</label>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                placeholder="contador@empresa.com"
                                            />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[11px] font-semibold text-slate-300">Contraseña</label>
                                                <button
                                                    type="button"
                                                    onClick={() => { setActiveTab('forgot'); setValidationError(null); forgotMutation.reset(); }}
                                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline transition-colors cursor-pointer"
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                    placeholder="••••••••"
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

                                        <button
                                            type="submit"
                                            disabled={loginMutation.isPending}
                                            className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            {loginMutation.isPending ? 'Iniciando Sesión...' : 'Entrar'}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </form>
                                )}

                                {/* Register View */}
                                {activeTab === 'register' && (
                                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                                        <div className="space-y-1 text-left">
                                            <label className="text-[11px] font-semibold text-slate-300">Correo Electrónico</label>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                placeholder="contador@empresa.com"
                                            />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <label className="text-[11px] font-semibold text-slate-300">Contraseña</label>
                                            <input
                                                name="password"
                                                type="password"
                                                required
                                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <label className="text-[11px] font-semibold text-slate-300">Confirmar Contraseña</label>
                                            <input
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                placeholder="Repite tu contraseña"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={registerMutation.isPending}
                                            className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            {registerMutation.isPending ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
                                        </button>
                                    </form>
                                )}
                            </>
                        ) : !isRegistered ? null : (
                            /* Verification view */
                            <div className="text-center py-4">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
                                    <MailOpen className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans">
                                    Verifica tu correo
                                </h3>
                                <p className="text-slate-400 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
                                    Hemos enviado un enlace de activación a:<br />
                                    <strong className="text-white">{registeredEmail}</strong>
                                </p>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                                    {timeLeft > 0 ? (
                                        <>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">El enlace expira en</p>
                                            <p className="text-xl font-mono font-bold text-indigo-400">{formatTime(timeLeft)}</p>
                                        </>
                                    ) : (
                                        <p className="text-xs font-semibold text-amber-500">El tiempo límite ha expirado.</p>
                                    )}
                                </div>

                                {resendMessage && (
                                    <div className={`mb-6 p-3 rounded-xl text-xs border ${resendMessage.type === 'success'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {resendMessage.text}
                                    </div>
                                )}

                                <button
                                    onClick={handleResendEmail}
                                    disabled={isResending}
                                    className="w-full mb-6 flex justify-center items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-white border border-white/10 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                                    Reenviar correo de confirmación
                                </button>

                                <button
                                    onClick={() => setIsRegistered(false)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors group cursor-pointer"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
                                    Volver al registro
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
