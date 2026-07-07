import { create } from "zustand";
import axios from "axios";
import { apiClient } from "../api/apiClient";
import { resetters } from "./storeReset";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos e Interfaces
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Forma de la respuesta exitosa del endpoint POST /billing/create-checkout-session.
 * NestJS devuelve { url } que puede ser null si Stripe no generó la sesión.
 */
export interface CheckoutSessionResponse {
  url: string | null;
}

/**
 * Estado reactivo del store de Billing.
 * Separar estado de acciones mejora la legibilidad y permite inferir tipos
 * precisos en los selectores de la UI.
 */
interface BillingState {
  /** true mientras se espera la respuesta del backend (útil para deshabilitar botones). */
  isLoading: boolean;

  /**
   * Mensaje de error específico devuelto por NestJS, o null si no hay error.
   * Se usa directamente para mostrar feedback al usuario sin transformaciones.
   */
  error: string | null;
}

interface BillingActions {
  /**
   * Inicia una sesión de Stripe Checkout para el priceId indicado.
   * Al recibir la URL de Stripe, redirige al usuario fuera de la SPA.
   *
   * @param priceId - El price_xxx de Stripe correspondiente al plan elegido.
   */
  checkoutPlan: (priceId: string) => Promise<void>;

  /** Limpia el error manualmente (útil al desmontar el componente o reintentar). */
  clearError: () => void;

  /** Resetea el store a su estado inicial (registrado en el sistema de storeReset). */
  reset: () => void;
}

export type BillingStore = BillingState & BillingActions;

// ─────────────────────────────────────────────────────────────────────────────
// Estado inicial
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_STATE: BillingState = {
  isLoading: false,
  error: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useBillingStore = create<BillingStore>()((set) => ({
  ...INITIAL_STATE,

  checkoutPlan: async (priceId: string): Promise<void> => {
    // 1. Activar estado de carga y limpiar errores previos antes de la petición.
    set({ isLoading: true, error: null });

    try {
      /**
       * 2. Llamada al backend.
       *
       * El token JWT de Supabase se inyecta automáticamente en el header
       * Authorization: Bearer <token> gracias al interceptor de solicitud
       * configurado en `src/api/apiClient.ts`. No es necesario leerlo aquí.
       *
       * Si en el futuro se cambia el proveedor de auth (ej. Auth0, JWT propio),
       * basta con actualizar el interceptor en apiClient.ts; este store no cambia.
       */
      const response = await apiClient.post<CheckoutSessionResponse>(
        "/billing/create-checkout-session",
        { priceId },
      );

      const { url } = response.data;

      /**
       * 3. Redireccion segura a Stripe Checkout.
       *
       * Usamos `window.location.href` en lugar de cualquier router de React porque:
       * - El destino es una URL EXTERNA (hosted de Stripe), no una ruta interna.
       * - Provoca una navegacion completa del navegador, abandonando la SPA, lo cual
       *   es exactamente el comportamiento esperado en un flujo de pago.
       * - Al completar el pago, Stripe devuelve al usuario a la `success_url`
       *   configurada en el backend (/dashboard?session_id=...).
       */
      if (!url) {
        throw new Error(
          "El servidor no devolvio una URL de pago. Intentalo de nuevo.",
        );
      }

      // La redireccion desvincula la SPA; no es necesario resetear isLoading aqui.
      window.location.href = url;
    } catch (err: unknown) {
      /**
       * 4. Manejo de errores robusto y tipado sin uso de `any`.
       *
       * Prioridad del mensaje de error:
       *   a) error.response.data.message  --> mensaje especifico de NestJS (ej. "Usuario no encontrado")
       *   b) error.message                --> mensaje generico de Axios o del throw manual
       *   c) Fallback estatico            --> ultimo recurso para errores completamente inesperados
       */
      let errorMessage =
        "Ocurrio un error inesperado al iniciar el proceso de pago.";

      if (axios.isAxiosError(err)) {
        // El backend NestJS puede devolver `message` como string o string[].
        const serverMessage = err.response?.data?.message;

        if (Array.isArray(serverMessage)) {
          // NestJS ValidationPipe devuelve un array de strings en errores de validacion.
          errorMessage = serverMessage.join(". ");
        } else if (typeof serverMessage === "string" && serverMessage.trim()) {
          errorMessage = serverMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error && err.message) {
        // Error lanzado manualmente (ej. url === null).
        errorMessage = err.message;
      }

      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ ...INITIAL_STATE }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Registro en el sistema de reset global
// Cuando el usuario hace logout, `resetAllStores()` en authStore llama a
// todos los resetters registrados aqui, limpiando el estado de billing.
// ─────────────────────────────────────────────────────────────────────────────
resetters.add(() => useBillingStore.getState().reset());
