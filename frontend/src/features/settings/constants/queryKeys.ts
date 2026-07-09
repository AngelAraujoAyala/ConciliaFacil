/**
 * Claves centralizadas de React Query para el dominio Settings / Usuario.
 * Usar siempre estas constantes para invalidar caché de forma consistente.
 */
export const settingsQueryKeys = {
  user: {
    all: ["user"] as const,
    profile: ["userProfile"] as const,
    preferences: ["userPreferences"] as const,
  },
} as const;
