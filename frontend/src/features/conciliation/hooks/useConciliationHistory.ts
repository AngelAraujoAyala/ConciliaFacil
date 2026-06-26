import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import { useAuthStore } from "../../../store/authStore";
import type { ConciliationSummary, ConciliationDetail } from "../types/history.types";

/**
 * Hook para obtener la lista optimizada de conciliaciones pasadas
 */
export const useConciliationHistory = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery<ConciliationSummary[]>({
    queryKey: ["conciliations", "history", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<ConciliationSummary[]>("/reconciliations", {
        params: { userId },
      });
      return data;
    },
    enabled: !!userId, // No dispara el fetch si no hay sesión activa
    staleTime: 1000 * 60 * 5, // 5 minutos de caché fresca
  });
};

/**
 * Hook para traer los payloads JSONB masivos de una auditoría en específico
 */
export const useConciliationDetail = (conciliationId: string | null) => {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery<ConciliationDetail>({
    queryKey: ["conciliations", "detail", conciliationId],
    queryFn: async () => {
      const { data } = await apiClient.get<ConciliationDetail>(
        `/reconciliations/${conciliationId}`,
        {
          params: { userId },
        },
      );
      return data;
    },
    enabled: !!conciliationId && !!userId, // Solo se ejecuta si se selecciona un ID real
    staleTime: 1000 * 60 * 30, // Al ser auditoría estática/histórica, puede durar más tiempo en caché
  });
};
