import { useMutation } from "@tanstack/react-query";
import { deleteUserAccount } from "../api/settingsApi";
import { supabase } from "../../../api/supabase";
import { clearAllApplicationData } from "../../../store/authStore";
import { getErrorMessage } from "../utils/getErrorMessage";
import { settingsFeedback } from "../utils/settingsFeedback";

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await deleteUserAccount();
      await supabase.auth.signOut();
      await clearAllApplicationData();
    },
    onSuccess: () => {
      settingsFeedback.info("Tu cuenta ha sido eliminada.");
      window.location.assign("/login");
    },
    onError: (error: unknown) => {
      settingsFeedback.error("No se pudo eliminar la cuenta", {
        description: getErrorMessage(error),
      });
    },
  });
}
