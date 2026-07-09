import { useGetPreferences } from "../features/settings/hooks/useUpdatePreferences";
import { DEFAULT_TIMEZONE } from "../utils/theme";

/** Zona horaria del usuario autenticado (fallback: Ciudad de México). */
export function useUserTimezone(): string {
  const { data } = useGetPreferences();
  return data?.timezone ?? DEFAULT_TIMEZONE;
}
