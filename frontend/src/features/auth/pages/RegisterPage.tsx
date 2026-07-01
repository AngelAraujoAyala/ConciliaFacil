import { useState, useEffect } from 'react';
import { MailOpen, ArrowLeft, RefreshCw } from 'lucide-react'; // Si no usas lucide-react, puedes cambiarlo por SVGs
import { supabase } from '../../../api/supabase'; // Asegúrate de que la ruta a tu cliente de Supabase sea correcta
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos en segundos
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Temporizador para la cuenta regresiva del token
  useEffect(() => {
    if (!isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  // Formateador de segundos a mm:ss (ej: 04:59)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Callback que se ejecutará cuando useRegisterMutation sea exitoso
  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setTimeLeft(300); // Reiniciar a 5 minutos
    setIsSubmitted(true);
    setResendMessage(null);
  };

  // 🚀 FUNCIÓN PARA REENVIAR EL CORREO DE CONFIRMACIÓN
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
      }
    });

    setIsResending(false);

    if (error) {
      setResendMessage({
        type: 'error',
        text: `Error al reenviar: ${error.message}`
      });
    } else {
      setResendMessage({
        type: 'success',
        text: '¡Enlace reenviado con éxito! Revisa tu bandeja de entrada.'
      });
      setTimeLeft(300); // Reiniciamos el contador de expiración a 5 minutos
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50/50 p-4">
      <div className="w-full max-w-md">

        {!isSubmitted ? (
          /* VISTA A: FORMULARIO DE REGISTRO STANDARD */
          <>
            <RegisterForm onSuccess={handleRegisterSuccess} />

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
                Inicia sesión aquí
              </a>
            </p>
          </>
        ) : (
          /* VISTA B: PANTALLA PREMIUM DE ESPERA POST-REGISTRO */
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center animate-fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-6">
              <MailOpen className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
              Verifica tu correo electrónico
            </h2>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Hemos enviado un enlace de activación premium a <br />
              <strong className="text-slate-900 font-semibold">{registeredEmail}</strong>.
            </p>

            {/* Caja del Contador Visual */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
              {timeLeft > 0 ? (
                <>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">
                    El enlace expirará en
                  </p>
                  <p className="text-2xl font-mono font-bold text-indigo-600">
                    {formatTime(timeLeft)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-amber-600">
                  El tiempo límite ha expirado.
                </p>
              )}
            </div>

            {/* Alertas de Éxito o Error de reenvío */}
            {resendMessage && (
              <div className={`mb-6 p-3 rounded-lg text-xs border ${resendMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                {resendMessage.text}
              </div>
            )}

            {/* BOTÓN PREMIUM DE REENVÍO */}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full mb-6 flex justify-center items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 focus:outline-none disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Reenviando...' : 'Reenviar correo de confirmación'}
            </button>

            {/* Botón sutil para regresar al formulario si se equivocó de correo */}
            <button
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition group"
            >
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
              Volver a intentar con otro correo
            </button>
          </div>
        )}

      </div>
    </div>
  );
}