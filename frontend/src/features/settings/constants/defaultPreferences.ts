import type { UserPreferencesPayload } from "../../../types/user";

/** Valores por defecto alineados con DEFAULT_USER_PREFERENCES del backend. */
export const DEFAULT_USER_PREFERENCES: UserPreferencesPayload = {
  theme: "light",
  timezone: "America/Mexico_City",
  emailNotifications: true,
  defaultRfc: null,
};
