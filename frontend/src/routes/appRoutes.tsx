import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Layout from "../components/Layout";
// Importaciones de tus componentes
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import ConciliationPage from "../features/conciliation/pages/ConciliationPage";
import { HistoryPage } from "../features/history/pages/HistoryPage";
import { SupportPage } from "../pages/SupportPage";

import RegisterPage from "../features/auth/pages/RegisterPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";

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
        path: "configuracion",
        element: (
          <div className="p-6 bg-white rounded-xl shadow-sm border">
            Ajustes de ConciliaFácil (Próximamente)
          </div>
        ),
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
