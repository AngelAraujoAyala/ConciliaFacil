import { apiClient } from "../../../api/apiClient";
import { supabase } from "../../../api/supabase";
import { buildFullName } from "../../../utils/profileIdentity";
import type {
  BillingPortalSession,
  UpdateAuthProfileInput,
  UserPreferencesPayload,
  UserProfile,
} from "../../../types/user";

// ── Perfil de negocio (Nest) ──────────────────────────────────────────────────

export async function fetchUserProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>("/users/me");
  return data;
}

// ── Perfil de identidad (Supabase Auth) ───────────────────────────────────────

export async function updateAuthProfile(input: UpdateAuthProfileInput): Promise<void> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const phone = input.phone?.trim() || undefined;
  const fullName = buildFullName(firstName, lastName);

  const { error } = await supabase.auth.updateUser({
    phone,
    data: {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone,
    },
  });

  if (error) throw error;

  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) throw refreshError;
}

// ── Preferencias (Nest — Fase 2) ──────────────────────────────────────────────

export async function fetchUserPreferences(): Promise<UserPreferencesPayload> {
  const { data } = await apiClient.get<UserPreferencesPayload>("/users/preferences");
  return data;
}

export async function updateUserPreferences(
  payload: Partial<UserPreferencesPayload>,
): Promise<UserPreferencesPayload> {
  const { data } = await apiClient.patch<UserPreferencesPayload>(
    "/users/preferences",
    payload,
  );
  return data;
}

// ── Facturación (Nest — Fase 3) ───────────────────────────────────────────────

export async function createBillingPortalSession(
  returnUrl?: string,
): Promise<BillingPortalSession> {
  const { data } = await apiClient.post<BillingPortalSession>(
    "/billing/create-portal-session",
    { returnUrl },
  );
  return data;
}

// ── Zona de peligro (Nest — Fase 5) ───────────────────────────────────────────

export async function exportUserData(): Promise<Blob> {
  const { data } = await apiClient.get<Blob>("/users/export", {
    responseType: "blob",
  });
  return data;
}

export async function deleteUserAccount(): Promise<void> {
  await apiClient.delete("/users/me");
}
