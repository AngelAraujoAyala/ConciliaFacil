import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const linkClass = (path: string) => `
    px-4 py-2 rounded-lg text-sm font-medium transition-colors
    ${location.pathname === path 
      ? 'bg-blue-600 text-white' 
      : 'text-gray-600 hover:bg-gray-100'}
  `;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600 tracking-tight">📊 ConciliaFácil</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">MVP Local</span>
          </div>
          <nav className="flex gap-2">
            <Link to="/" className={linkClass('/')}>Nueva Conciliación</Link>
            <Link to="/historial" className={linkClass('/historial')}>Historial</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}