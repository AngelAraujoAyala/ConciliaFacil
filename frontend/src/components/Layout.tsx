import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SidebarProvider, useSidebar } from './SidebarContext';

function LayoutContent() {
  // Usa el hook para obtener el estado actual
  const { isExpanded } = useSidebar();

  // Calcula el padding izquierdo de forma dinámica
  // Si está expandido, usa pl-64, si no, pl-16
  const paddingClassName = isExpanded ? 'pl-64' : 'pl-16';

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <Navbar />
      <Sidebar />

      <div className={`pt-16 ${paddingClassName} transition-all duration-300`}>
        <main className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}