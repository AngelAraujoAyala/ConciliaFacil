import type { User } from "@supabase/supabase-js";

export interface ParsedProfileNames {
  firstName: string;
  lastName: string;
  fullName: string;
}

type UserMetadata = Record<string, unknown> | undefined;

/** Compone el nombre completo a partir de nombre y apellido. */
export function buildFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/** Extrae nombre/apellido desde metadata de Supabase con fallback legacy a full_name. */
export function parseProfileNames(metadata: UserMetadata): ParsedProfileNames {
  const firstName =
    typeof metadata?.first_name === "string" ? metadata.first_name.trim() : "";
  const lastName =
    typeof metadata?.last_name === "string" ? metadata.last_name.trim() : "";

  if (firstName || lastName) {
    return {
      firstName,
      lastName,
      fullName: buildFullName(firstName, lastName),
    };
  }

  const legacyFullName =
    typeof metadata?.full_name === "string" ? metadata.full_name.trim() : "";

  if (!legacyFullName) {
    return { firstName: "", lastName: "", fullName: "" };
  }

  const parts = legacyFullName.split(/\s+/);
  const parsedFirstName = parts[0] ?? "";
  const parsedLastName = parts.slice(1).join(" ");

  return {
    firstName: parsedFirstName,
    lastName: parsedLastName,
    fullName: legacyFullName,
  };
}

/** Obtiene el teléfono del usuario desde Auth o metadata. */
export function getProfilePhone(user: User | null): string {
  if (!user) return "";
  const metadataPhone =
    typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
  return user.phone || metadataPhone || "";
}

/** Nombre visible para Navbar, dashboard y saludos. */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "Usuario";

  const { fullName } = parseProfileNames(user.user_metadata);
  if (fullName) return fullName;

  return user.email?.split("@")[0] || "Usuario";
}

/** Valores iniciales del formulario de perfil desde Supabase Auth. */
export function getProfileFormValues(user: User | null) {
  const { firstName, lastName } = parseProfileNames(user?.user_metadata);

  return {
    firstName,
    lastName,
    phone: getProfilePhone(user),
  };
}
