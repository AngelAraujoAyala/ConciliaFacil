import { useMutation } from "@tanstack/react-query";
import { updateAuthProfile } from "../api/settingsApi";
import type { UpdateAuthProfileInput } from "../../../types/user";
import { useAuthStore } from "../../../store/authStore";
import { useSettingsStore } from "../../../store/useSettingsStore";
import { supabase } from "../../../api/supabase";
import { getErrorMessage } from "../utils/getErrorMessage";
import { settingsFeedback } from "../utils/settingsFeedback";

export function useUpdateProfile() {
  const initializeProfile = useSettingsStore((state) => state.initializeProfile);

  return useMutation({
    mutationFn: (input: UpdateAuthProfileInput) => updateAuthProfile(input),
    onSuccess: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        useAuthStore.setState({
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
        });
        initializeProfile(session.user);
      }

      settingsFeedback.success("Perfil guardado con éxito.");
    },
    onError: (error: unknown) => {
      settingsFeedback.error("No se pudo actualizar el perfil", {
        description: getErrorMessage(
          error,
          "Ocurrió un error al actualizar tu información.",
        ),
      });
    },
  });
}
