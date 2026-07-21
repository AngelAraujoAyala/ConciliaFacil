import React from "react";
import { Loader2, RefreshCw, Sun, Moon } from "lucide-react";
import { useGetPreferences, useUpdatePreferences } from "../../hooks/useUpdatePreferences";
import { applyTheme } from "../../../../utils/theme";

export const PreferencesTab: React.FC = () => {
  const { data: preferences, isLoading, isError, refetch, isFetching } = useGetPreferences();
  const { mutateAsync: updatePreferences, isPending } = useUpdatePreferences();

  const theme = preferences?.theme ?? "light";

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    if (newTheme === theme) return;
    try {
      applyTheme(newTheme);
      await updatePreferences({ theme: newTheme });
    } catch (err) {
      console.error("Error al actualizar tema:", err);
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="space-y-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <p>No se pudo cargar la configuración de tema. Intenta recargar la página.</p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
        >
          {isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Reintentar
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Tema de la interfaz
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personaliza la apariencia visual de la aplicación.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => handleThemeChange("light")}
            disabled={isPending}
            className={`relative flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-150
              ${
                theme === "light"
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            <Sun className={`h-6 w-6 ${theme === "light" ? "text-amber-500" : "text-slate-400"}`} />
            <span>Claro</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange("dark")}
            disabled={isPending}
            className={`relative flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-150
              ${
                theme === "dark"
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-xs dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            <Moon className={`h-6 w-6 ${theme === "dark" ? "text-indigo-400" : "text-slate-400"}`} />
            <span>Oscuro</span>
          </button>
        </div>
      </div>
    </section>
  );
};
