import { useMutation } from "@tanstack/react-query";
import { sendSupportEmail, type SendSupportEmailPayload } from "../api/supportApi";
import { toast } from "sonner";

export function useSendSupportEmail() {
  return useMutation({
    mutationFn: (payload: SendSupportEmailPayload) => sendSupportEmail(payload),
    onSuccess: () => {
      toast.success("Mensaje enviado correctamente", {
        description: "Nos pondremos en contacto contigo a la brevedad.",
      });
    },
    onError: () => {
      toast.error("No se pudo enviar el mensaje", {
        description: "Por favor intenta de nuevo o contáctanos por WhatsApp.",
      });
    },
  });
}
