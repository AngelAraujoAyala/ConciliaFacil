import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Layout from "../components/Layout";
// Importaciones de tus componentes
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import ConciliationPage from "../features/conciliation/pages/ConciliationPage";
import { HistoryPage } from "../features/history/pages/HistoryPage";
import { SupportPage } from "../features/support/pages/SupportPage";
import { PricingPage } from "../features/billing/pages/PricingPage";
import { SettingsLayout } from "../features/settings/components/SettingsLayout";

import RegisterPage from "../features/auth/pages/RegisterPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import AuthCallback from "../features/auth/pages/AuthCallback";
import TerminosCondicionesPage from "../pages/TerminosCondicionesPage";
import AvisoPrivacidadPage from "../pages/AvisoPrivacidadPage";

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
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/legal/terminos",
    element: <TerminosCondicionesPage />,
  },
  {
    path: "/legal/privacidad",
    element: <AvisoPrivacidadPage />,
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
