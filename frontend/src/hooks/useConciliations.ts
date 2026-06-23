import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";
import { useConciliationStore } from "../store/useConciliationStore"; // Ajusta la ruta a tu store real

// Clave única para identificar el caché del historial en TanStack Query
const HISTORY_QUERY_KEY = ["conciliations-history"];

/**
 * 📊 HOOK 1: Para obtener el historial optimizado (GET)
 */
export function useConciliationHistory() {
  return useQuery({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get("/conciliations");
      return response.data; // Retorna el array de conciliaciones simplificadas
    },
  });
}

/**
 * 💾 HOOK 2: Para guardar el progreso actual (POST) e interceptar el Paywall
 */
export function useSaveConciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      status: "DRAFT" | "COMPLETED";
    }) => {
      // 🕵️‍♂️ Truco Maestro: Jalamos el estado vivo de Zustand justo cuando el usuario da clic
      const { matches, remainingInvoices, successRate } =
        useConciliationStore.getState();

      // Fusionamos el título y estatus con los datos pesados del motor
      const fullBody = {
        title: payload.title,
        status: payload.status,
        matches,
        remainingInvoices,
        successRate,
      };

      const response = await apiClient.post("/conciliations", fullBody);
      return response.data;
    },
    onSuccess: (data) => {
      // 1. Sincronizamos el ID generado por NestJS en nuestro Zustand por si siguen editando
      // Nota: Asegúrate de tener una acción para actualizar esto en tu store, o puedes adaptarla
      useConciliationStore.setState({ currentConciliationId: data.id });

      // 2. ⚡ MAGIA DE TANSTACK QUERY: Le avisamos al historial que sus datos ya son viejos.
      // Esto hace que la pantalla del historial se refresque solita de fondo de inmediato.
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    },
    onError: (error: any) => {
      // Aquí atrapamos el error 400 que NestJS avienta si se agotó la prueba gratis
      const serverMessage =
        error.response?.data?.message || "Error al conectar con el servidor";
      console.error("Error de persistencia:", serverMessage);
    },
  });
}
