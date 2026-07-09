import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Layout from "../components/Layout";
// Importaciones de tus componentes
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import ConciliationPage from "../features/conciliation/pages/ConciliationPage";
import { HistoryPage } from "../features/history/pages/HistoryPage";
import { SupportPage } from "../pages/SupportPage";
import { PricingPage } from "../features/billing/pages/PricingPage";
import { SettingsLayout } from "../features/settings/components/SettingsLayout";

import RegisterPage from "../features/auth/pages/RegisterPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import AuthCallback from "../features/auth/pages/AuthCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/register",
    element: (
      <ProtectedRoute requireAuth={false}>
        <RegisterPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <ProtectedRoute requireAuth={false}>
        <LoginPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    // Ruta publica — accesible sin autenticacion para que usuarios FREE
    // puedan upgrade y para que la landing page enlace a ella.
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/dashboard",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute requireAuth={true}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "nueva-conciliacion",
        element: <ConciliationPage />,
      },
      {
        path: "historial",
        element: <HistoryPage />,
      },
      {
        path: "planes",
        element: <PricingPage />,
      },
      {
        path: "configuracion",
        element: <Navigate to="/home/configuracion/perfil" replace />,
      },
      {
        path: "configuracion/:tab",
        element: <SettingsLayout />,
      },
      {
        path: "soporte",
        element: <SupportPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
