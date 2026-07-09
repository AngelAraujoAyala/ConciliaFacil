import type { SettingsTab } from "../../../store/useSettingsStore";

export const DEFAULT_SETTINGS_TAB: SettingsTab = "perfil";

export const SETTINGS_TABS = [
  "perfil",
  "facturacion",
  "seguridad",
  "preferencias",
  "peligro",
] as const satisfies readonly SettingsTab[];

const SETTINGS_TAB_SET = new Set<string>(SETTINGS_TABS);

export function isSettingsTab(value: string | undefined): value is SettingsTab {
  return value !== undefined && SETTINGS_TAB_SET.has(value);
}

export function getSettingsTabPath(tab: SettingsTab = DEFAULT_SETTINGS_TAB): string {
  return `/home/configuracion/${tab}`;
}
