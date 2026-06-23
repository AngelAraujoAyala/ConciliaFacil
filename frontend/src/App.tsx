import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/appRoutes';
import { useAuthStore } from './store/authStore';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Pantalla de carga limpia mientras Supabase verifica si hay una sesión activa
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}