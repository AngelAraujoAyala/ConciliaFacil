import { useMutation } from "@tanstack/react-query";
import { createBillingPortalSession } from "../api/settingsApi";
import { getErrorMessage } from "../utils/getErrorMessage";
import { settingsFeedback } from "../utils/settingsFeedback";

interface BillingPortalInput {
  returnUrl?: string;
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: ({ returnUrl }: BillingPortalInput = {}) =>
      createBillingPortalSession(returnUrl),
    onSuccess: (session) => {
      window.location.assign(session.url);
    },
    onError: (error: unknown) => {
      settingsFeedback.error("No se pudo abrir el portal de facturación", {
        description: getErrorMessage(error),
      });
    },
  });
}
