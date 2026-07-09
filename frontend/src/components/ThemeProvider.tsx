import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useGetPreferences } from "../features/settings/hooks/useUpdatePreferences";
import { applyTheme, watchSystemTheme } from "../utils/theme";

/**
 * Carga preferencias del backend y aplica tema globalmente.
 * Debe montarse una sola vez en App.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPreferences = useSettingsStore((state) => state.setPreferences);
  const { data: preferences, isFetched } = useGetPreferences({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      applyTheme("light");
      return;
    }

    if (!isFetched) return;

    if (!preferences) {
      applyTheme("light");
      return;
    }

    setPreferences({
      theme: preferences.theme,
      timezone: preferences.timezone,
      emailNotifications: preferences.emailNotifications,
      defaultRfc: preferences.defaultRfc ?? "",
    });

    applyTheme(preferences.theme);
  }, [isAuthenticated, isFetched, preferences, setPreferences]);

  useEffect(() => {
    if (!isAuthenticated || preferences?.theme !== "system") return;

    return watchSystemTheme((resolved) => {
      document.documentElement.classList.toggle("dark", resolved === "dark");
    });
  }, [isAuthenticated, preferences?.theme]);

  return children;
}
