import { create } from "zustand";
import { resetters } from "./storeReset";
import type { User } from "@supabase/supabase-js";
import {
  getProfileFormValues,
  getProfilePhone,
  parseProfileNames,
} from "../utils/profileIdentity";
import { DEFAULT_USER_PREFERENCES } from "../features/settings/constants/defaultPreferences";

export type SettingsTab = "perfil" | "facturacion" | "seguridad" | "tema" | "peligro" | "legal";

export interface ProfileDraft {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface UserPreferences {
  theme: "light" | "dark";
}

interface SettingsState {
  profileDraft: ProfileDraft;
  preferences: UserPreferences;
}

interface SettingsActions {
  setProfileDraft: (draft: Partial<ProfileDraft>) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  initializeProfile: (user: User | null) => void;
  reset: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

const INITIAL_STATE: SettingsState = {
  profileDraft: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  },
  preferences: { ...DEFAULT_USER_PREFERENCES },
};

export const useSettingsStore = create<SettingsStore>()((set) => ({
  ...INITIAL_STATE,

  setProfileDraft: (draft) =>
    set((state) => ({
      profileDraft: { ...state.profileDraft, ...draft },
    })),

  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),

  initializeProfile: (user) => {
    if (!user) return;

    const { firstName, lastName } = parseProfileNames(user.user_metadata);

    set({
      profileDraft: {
        firstName,
        lastName,
        phone: getProfilePhone(user),
        email: user.email || "",
      },
    });
  },

  reset: () => set({ ...INITIAL_STATE }),
}));

resetters.add(() => useSettingsStore.getState().reset());

/** Valores del formulario de perfil derivados del usuario de Auth. */
export function getProfileDraftFromUser(user: User | null): ProfileDraft {
  const formValues = getProfileFormValues(user);
  return {
    ...formValues,
    email: user?.email || "",
  };
}
