import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Menu, LogOut, RefreshCw } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useAuthStore } from "../store/authStore"; // Ajusta la ruta a tu store de Zustand
import { supabase } from "../api/apiClient";

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
  const displayName = user?.user_metadata?.full_name || userEmail.split("@")[0];

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
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 z-40 px-6 flex items-center shadow-sm">
      {/* Botón de Hamburguesa para el Sidebar */}
      <button
        onClick={toggleSidebar}
        className="mr-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <Menu size={24} className="text-slate-600" />
      </button>

      <div className="flex-1"></div>

      {/* Contenedor del Perfil y Dropdown */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* Información del Usuario (Oculta en pantallas muy pequeñas) */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-700 capitalize">
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
          <div className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Encabezado del menú móvil (Solo visible si el texto principal se ocultó) */}
            <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
              <p className="text-sm font-semibold text-slate-700 capitalize truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>

            {/* Opción: Cambiar Cuenta */}
            <button
              onClick={handleSwitchAccount}
              className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={16} className="text-slate-400" />
              <span>Cambiar cuenta</span>
            </button>

            <hr className="my-1 border-slate-100" />

            {/* Opción: Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
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
