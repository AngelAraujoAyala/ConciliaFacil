import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/appRoutes";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "sonner";
import { GlobalModal } from "./components/ui/GlobalModal";
import { ThemeProvider } from "./components/ThemeProvider";

import { LoadingPage } from "./components/ui/LoadingState";

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Pantalla de carga limpia mientras Supabase verifica si hay una sesión activa
  if (isLoading) {
    return <LoadingPage message="Iniciando ConciliaFácil..." fullscreen />;
  }

  return (
    <ThemeProvider>
      <Toaster richColors position="top-right" closeButton />
      <GlobalModal />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
