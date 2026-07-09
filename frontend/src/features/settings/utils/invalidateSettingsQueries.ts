import type { QueryClient } from "@tanstack/react-query";
import { settingsQueryKeys } from "../constants/queryKeys";

/** Invalida la caché del perfil de negocio (GET /users/me). */
export function invalidateUserProfile(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user.profile });
}

/** Invalida la caché de preferencias (GET /users/preferences). */
export function invalidateUserPreferences(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: settingsQueryKeys.user.preferences });
}
