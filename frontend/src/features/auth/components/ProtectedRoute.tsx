import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Bloqueo de UX limpio mientras Zustand/Supabase resuelven el estado de la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-medium text-slate-500">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  // CASO 1: La ruta requiere autenticación pero el usuario NO está logueado
  if (requireAuth && !isAuthenticated) {
    // Guardamos la ubicación actual ('from') para poder redirigir al usuario de vuelta tras loguearse
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // CASO 2: La ruta es exclusiva de invitados pero el usuario SÍ está logueado
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Si pasa las validaciones, renderiza el contenido protegido o público
  return <>{children}</>;
};