import { NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  BarChart2,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  to: string;
}

export default function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const location = useLocation();
  const isSettingsActive = location.pathname.startsWith("/home/configuracion");

  const menuItems: MenuItem[] = [
    { icon: Home, label: "Inicio", to: "/home" },
    {
      icon: BarChart2,
      label: "Conciliaciones",
      to: "/home/nueva-conciliacion",
    },
    { icon: FileText, label: "Historial", to: "/home/historial" },
    { icon: CreditCard, label: "Planes", to: "/home/planes" },
  ];

  return (
    <div
      className={`bg-slate-900 text-white h-screen fixed left-0 top-0 z-50 transition-all duration-300 flex flex-col justify-between
        ${isExpanded ? "w-64" : "w-16"}`}
    >
      <div>
        {/* Header del Sidebar */}
        <div
          className={`py-4 flex items-center justify-between ${isExpanded ? "pl-2 pr-4" : "justify-center px-0"}`}
        >
          {isExpanded ? (
            <div className="flex items-center gap-0 animate-in fade-in duration-200 overflow-hidden -ml-2">
              <img
                src="/cf_logo.png"
                alt="ConciliaFácil Logo"
                className="h-12 w-auto object-contain -mr-6"
              />
              <span className="text-lg tracking-wide select-none whitespace-nowrap">
                <span className="font-extrabold text-slate-100">Concilia</span>
                <span className="font-semibold bg-linear-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Fácil</span>
              </span>
            </div>
          ) : (
            <div className="h-12 w-0 overflow-hidden" /> /* Espaciador invisible para mantener la consistencia de altura */
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            {isExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menú de Navegación */}
        <nav className="mt-6 px-2 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.to}
                end={item.to === "/home"}
                className={({ isActive }) => `
                  flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition-all group
                  ${isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-medium border-l-4 border-emerald-400 rounded-l-none pl-2"
                    : "text-slate-400"
                  }
                `}
              >
                <div className="shrink-0">
                  <Icon size={22} />
                </div>
                <span
                  className={`transition-opacity duration-200 whitespace-nowrap ${!isExpanded && "opacity-0 overflow-hidden w-0"}`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer (Configuración y Soporte) */}
      <div className="p-2 border-t border-slate-800 space-y-1">
        {/* Link de Configuración */}
        <NavLink
          to="/home/configuracion/perfil"
          className={() => `
            flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all
            ${isSettingsActive
              ? "bg-emerald-500/10 text-emerald-400 font-medium border-l-4 border-emerald-400 rounded-l-none pl-2"
              : "text-slate-400"
            }
          `}
        >
          <Settings size={22} className="shrink-0" />
          <span
            className={`transition-opacity duration-200 whitespace-nowrap ${!isExpanded && "opacity-0 overflow-hidden w-0"}`}
          >
            Configuración
          </span>
        </NavLink>

        {/* Link de Soporte */}
        <NavLink
          to="/home/soporte"
          className={({ isActive }) => `
            flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all
            ${isActive
              ? "bg-emerald-500/10 text-emerald-400 font-medium border-l-4 border-emerald-400 rounded-l-none pl-2"
              : "text-slate-400"
            }
          `}
        >
          <HelpCircle size={22} className="shrink-0" />
          <span
            className={`transition-opacity duration-200 whitespace-nowrap ${!isExpanded && "opacity-0 overflow-hidden w-0"}`}
          >
            Soporte
          </span>
        </NavLink>

        {/* Enlaces Legales cuando está expandido */}
        {isExpanded && (
          <div className="pt-2 px-3 pb-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 border-t border-slate-800/60 animate-in fade-in duration-200">
            <NavLink
              to="/legal/terminos"
              className="hover:text-slate-300 transition-colors underline underline-offset-2"
            >
              Términos
            </NavLink>
            <span>•</span>
            <NavLink
              to="/legal/privacidad"
              className="hover:text-slate-300 transition-colors underline underline-offset-2"
            >
              Privacidad
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}
