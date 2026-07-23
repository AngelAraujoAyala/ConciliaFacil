import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabase";
import { LoadingPage } from "../../../components/ui/LoadingState";

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
    <LoadingPage
      message="Verificando tus datos..."
      subMessage="Preparando tu espacio de trabajo en ConciliaFácil. Por favor, espera un momento."
      fullscreen
    />
  );
}
