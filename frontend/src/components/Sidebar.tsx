import { NavLink } from "react-router-dom";
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
  // Usa el hook para obtener el estado y la función de toggle
  const { isExpanded, toggleSidebar } = useSidebar();

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
          className={`p-4 flex items-center ${isExpanded ? "justify-between" : "justify-center"}`}
        >
          {isExpanded && (
            <span className="font-bold text-lg tracking-wider text-emerald-400 animate-in fade-in duration-200">
              ConciliaFácil
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
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
          to="/home/configuracion"
          className={({ isActive }) => `
            flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all
            ${isActive
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
      </div>
    </div>
  );
}
