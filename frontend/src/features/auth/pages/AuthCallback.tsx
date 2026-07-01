import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Escuchar en tiempo real los cambios del estado de autenticación.
    // Supabase procesa automáticamente los tokens que vienen en el hash (#access_token=...)
    // y emite el evento de firma de sesión (SIGNED_IN).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Limpiar la URL de forma estética para evitar fugas de token en el historial del navegador
          if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
          }
          // Redirigir al dashboard (/dashboard que a su vez se redirige a /home)
          navigate("/dashboard", { replace: true });
        } else if (event === "SIGNED_OUT") {
          navigate("/login", { replace: true });
        }
      }
    );

    // 2. Comprobación de respaldo por si la sesión ya fue resuelta por el cliente
    const checkCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        navigate("/dashboard", { replace: true });
      }
    };

    checkCurrentSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50/50 p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="relative flex items-center justify-center">
          {/* Spinner animado con micro-animaciones */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600" />
          <span className="absolute text-indigo-600 text-xs font-bold">CF</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mt-2">
          Verificando tus datos...
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Preparando tu espacio de trabajo en ConciliaFácil. Por favor, espera un momento.
        </p>
      </div>
    </div>
  );
}
