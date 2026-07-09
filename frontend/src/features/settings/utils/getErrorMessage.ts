import axios from "axios";

/** Extrae un mensaje legible de errores desconocidos o de Axios. */
export function getErrorMessage(
  err: unknown,
  fallback = "Ocurrió un error inesperado.",
): string {
  if (!err) return fallback;

  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (typeof data?.message === "string") return data.message;
    if (typeof err.message === "string" && err.message.length > 0) return err.message;
  }

  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;

  if (typeof err === "object" && err !== null && "message" in err) {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }

  return fallback;
}
