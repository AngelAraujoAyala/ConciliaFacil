import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

import { LoadingPage } from '../../../components/ui/LoadingState';

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
    return <LoadingPage message="Verificando credenciales..." fullscreen />;
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