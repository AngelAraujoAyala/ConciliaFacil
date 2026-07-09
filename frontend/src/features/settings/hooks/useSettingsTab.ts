import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { SettingsTab } from "../../../store/useSettingsStore";
import {
  DEFAULT_SETTINGS_TAB,
  getSettingsTabPath,
  isSettingsTab,
} from "../constants/settingsTabs";

/**
 * Fuente de verdad de la tab activa: la URL (/home/configuracion/:tab).
 */
export function useSettingsTab() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  const activeTab: SettingsTab = isSettingsTab(tab) ? tab : DEFAULT_SETTINGS_TAB;

  useEffect(() => {
    if (!isSettingsTab(tab)) {
      navigate(getSettingsTabPath(DEFAULT_SETTINGS_TAB), { replace: true });
    }
  }, [tab, navigate]);

  const setActiveTab = useCallback(
    (nextTab: SettingsTab) => {
      navigate(getSettingsTabPath(nextTab));
    },
    [navigate],
  );

  return { activeTab, setActiveTab };
}
