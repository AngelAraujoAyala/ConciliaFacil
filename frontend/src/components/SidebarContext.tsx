import { createContext, useState, useContext, type ReactNode } from 'react';

// Define la interfaz para el estado del sidebar
interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

// Crea el contexto con valores por defecto
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Define las props para el proveedor del contexto
interface SidebarProviderProps {
  children: ReactNode;
}

// Crea el componente proveedor
export function SidebarProvider({ children }: SidebarProviderProps) {
  // Estado inicial del sidebar (puedes cambiarlo a false si quieres que inicie minimizado)
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Crea un hook personalizado para usar el contexto fácilmente
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar debe ser usado dentro de un SidebarProvider');
  }
  return context;
}