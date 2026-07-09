import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/appRoutes";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "sonner";
import { GlobalModal } from "./components/ui/GlobalModal";
import { ThemeProvider } from "./components/ThemeProvider";

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Pantalla de carga limpia mientras Supabase verifica si hay una sesión activa
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Toaster richColors position="top-right" closeButton />
      <GlobalModal />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
