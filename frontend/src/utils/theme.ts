export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "concilia:theme";
export const DEFAULT_TIMEZONE = "America/Mexico_City";

const VALID_THEMES = new Set<ThemePreference>(["light", "dark", "system"]);

/** Lee la preferencia de tema guardada localmente (cache de UX). */
export function getStoredTheme(): ThemePreference | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored && VALID_THEMES.has(stored as ThemePreference)
    ? (stored as ThemePreference)
    : null;
}

function persistTheme(theme: ThemePreference): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/** Resuelve "system" al tema efectivo según preferencias del SO. */
export function resolveTheme(theme: ThemePreference): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Aplica la clase `dark` en `<html>` según la preferencia del usuario. */
export function applyTheme(theme: ThemePreference, options?: { persist?: boolean }): void {
  if (typeof document === "undefined") return;

  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = theme;

  if (options?.persist !== false) {
    persistTheme(theme);
  }
}

/** Aplica el tema cacheado antes del primer render de React (evita flash). */
export function bootstrapThemeFromStorage(): void {
  applyTheme(getStoredTheme() ?? "light", { persist: false });
}

/** Escucha cambios del sistema cuando el tema es "system". */
export function watchSystemTheme(onChange: (resolved: "light" | "dark") => void) {
  if (typeof window === "undefined") return () => undefined;

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onChange(media.matches ? "dark" : "light");

  media.addEventListener("change", handler);
  return () => media.removeEventListener("change", handler);
}
