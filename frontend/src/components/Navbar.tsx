import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Menu, LogOut, RefreshCw } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useAuthStore } from "../store/authStore"; // Ajusta la ruta a tu store de Zustand
import { supabase } from "../api/supabase";
import { useDisplayName } from "../hooks/useDisplayName";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  // Consumimos el usuario autenticado desde el store global de Zustand
  const { user } = useAuthStore();

  // Estado para controlar la visibilidad del menú desplegable
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extraer el nombre/identificador del usuario de forma segura
  const userEmail = user?.email || "Usuario Concilia";
  const displayName = useDisplayName();

  // Cerrar el dropdown automáticamente si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsDropdownOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const handleSwitchAccount = async () => {
    // Para cambiar de cuenta en Supabase, la mejor práctica es cerrar la sesión actual
    // y redirigir explícitamente al flujo de login limpio.
    await handleLogout();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 z-40 px-6 flex items-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
      {/* Botón de Hamburguesa para el Sidebar */}
      <button
        onClick={toggleSidebar}
        className="mr-4 rounded-lg p-1.5 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-600"
      >
        <Menu size={24} className="text-slate-600 dark:text-slate-300" />
      </button>

      <div className="flex-1"></div>

      {/* Contenedor del Perfil y Dropdown */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* Información del Usuario (Oculta en pantallas muy pequeñas) */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-700 capitalize dark:text-slate-200">
            {displayName}
          </p>
          <p className="text-xs text-slate-400 truncate max-w-45">
            {userEmail}
          </p>
        </div>

        {/* Botón del Avatar que dispara el Dropdown */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <User size={20} />
        </button>

        {/* Menú Desplegable Flotante */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 z-50 w-56 animate-in fade-in slide-in-from-top-1 rounded-xl border border-slate-200 bg-white py-2 shadow-lg duration-150 dark:border-slate-700 dark:bg-slate-900">
            <div className="ui-divider border-b px-4 py-2 sm:hidden">
              <p className="truncate text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-400">{userEmail}</p>
            </div>

            <button
              onClick={handleSwitchAccount}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw size={16} className="text-slate-400 dark:text-slate-500" />
              <span>Cambiar cuenta</span>
            </button>

            <hr className="ui-divider my-1" />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut size={16} className="text-red-500" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
