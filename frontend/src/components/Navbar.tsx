import { User, Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 z-40 px-6 flex items-center shadow-sm">
      <button
        onClick={toggleSidebar}
        className="mr-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <Menu size={24} className="text-slate-600" />
      </button>

      <div className="flex-1"></div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-700">
            Usuario Concilia
          </p>
          <p className="text-xs text-slate-400">Contador</p>
        </div>

        <button className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
