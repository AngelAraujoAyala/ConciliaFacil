import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserPreferences,
  updateUserPreferences,
} from "../api/settingsApi";
import type { UserPreferencesPayload } from "../../../types/user";
import { useAuthStore } from "../../../store/authStore";
import { useSettingsStore } from "../../../store/useSettingsStore";
import { settingsQueryKeys } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/getErrorMessage";
import { settingsFeedback } from "../utils/settingsFeedback";
import { applyTheme } from "../../../utils/theme";

interface UseGetPreferencesOptions {
  enabled?: boolean;
}

export function useGetPreferences(options: UseGetPreferencesOptions = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: settingsQueryKeys.user.preferences,
    queryFn: fetchUserPreferences,
    retry: false,
    enabled: options.enabled ?? isAuthenticated,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const setPreferences = useSettingsStore((state) => state.setPreferences);

  return useMutation({
    mutationFn: (payload: Partial<UserPreferencesPayload>) =>
      updateUserPreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.user.preferences, data);
      setPreferences({
        theme: data.theme,
      });
      applyTheme(data.theme);
      settingsFeedback.success("Tema actualizado.");
    },
    onError: (error: unknown) => {
      settingsFeedback.error("No se pudieron guardar las preferencias", {
        description: getErrorMessage(error),
      });
    },
  });
}
