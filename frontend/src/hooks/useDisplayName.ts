import { useAuthStore } from "../store/authStore";
import { getUserDisplayName } from "../utils/profileIdentity";

/** Nombre visible del usuario autenticado (reactivo vía authStore). */
export function useDisplayName(): string {
  const user = useAuthStore((state) => state.user);
  return getUserDisplayName(user);
}
