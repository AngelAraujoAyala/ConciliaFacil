import React from "react";
import {
  User,
  CreditCard,
  Shield,
  SlidersHorizontal,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { SettingsTab } from "../../../store/useSettingsStore";
import { useSettingsTab } from "../hooks/useSettingsTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { BillingTab } from "./tabs/BillingTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { PreferencesTab } from "./tabs/PreferencesTab";
import { DangerTab } from "./tabs/DangerTab";

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de pestañas
// ─────────────────────────────────────────────────────────────────────────────

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
}

const TABS: TabConfig[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "facturacion", label: "Facturación", icon: CreditCard },
  { id: "seguridad", label: "Seguridad", icon: Shield },
  { id: "tema", label: "Tema", icon: SlidersHorizontal },
  { id: "peligro", label: "Eliminar cuenta", icon: AlertTriangle, danger: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de paneles reales
// ─────────────────────────────────────────────────────────────────────────────

const PANELS: Record<SettingsTab, React.ReactElement> = {
  perfil:       <ProfileTab />,
  facturacion:  <BillingTab />,
  seguridad:    <SecurityTab />,
  tema:         <PreferencesTab />,
  peligro:      <DangerTab />,
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export const SettingsLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useSettingsTab();

  return (
    <div className="space-y-0">
      <div className="ui-divider -mx-6 -mt-6 mb-8 border-b bg-white px-6 py-5 dark:bg-slate-900">
        <h1 className="ui-page-title text-xl">Configuración</h1>
        <p className="ui-page-subtitle mt-0.5">
          Administra tu cuenta, seguridad y preferencias.
        </p>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">

          {/* ── Sidebar de navegación interna ─────────────────────────── */}
          <aside className="w-full shrink-0 md:w-56">
            <nav className="flex flex-col gap-0.5" aria-label="Secciones de configuración">
              {TABS.map(({ id, label, icon: Icon, danger }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900
                      ${isActive
                        ? danger
                          ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                        : danger
                          ? "text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      size={17}
                      className={`shrink-0 transition-colors ${isActive
                        ? danger
                          ? "text-red-500"
                          : "text-indigo-600"
                        : danger
                          ? "text-red-400 group-hover:text-red-500 dark:text-red-500 dark:group-hover:text-red-400"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                        }`}
                    />
                    <span className="truncate">{label}</span>
                    {isActive && (
                      <span
                        className={`ml-auto h-1.5 w-1.5 rounded-full ${danger ? "bg-red-500" : "bg-indigo-600"
                          }`}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── Panel de contenido ────────────────────────────────────── */}
          <main className="min-w-0 flex-1">
            <div className="ui-card-lg p-6">
              {PANELS[activeTab]}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};
