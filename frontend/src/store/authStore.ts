import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';
import { resetAllStores } from './storeReset';
import { del } from 'idb-keyval';
import { resetters } from './storeReset';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const clearAllApplicationData = async () => {
  // 1. Reset all registered Zustand stores
  resetAllStores();

  // 2. Delete persisting data from IndexedDB
  try {
    await del("conciliafacil-storage");
  } catch (err) {
    console.error("Error clearing IndexedDB storage:", err);
  }

  // 3. Clear LocalStorage and SessionStorage
  localStorage.clear();
  sessionStorage.clear();
};

export const useAuthStore = create<AuthState>((set) => ({
  ...INITIAL_STATE,

  initializeAuth: async () => {
    // 1. Validar si ya existe una sesión guardada localmente al cargar la app
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      await clearAllApplicationData();
    }

    set({ 
      user: session?.user ?? null, 
      isAuthenticated: !!session, 
      isLoading: false 
    });

    // 2. Escuchar cambios de estado en tiempo real (login, logout, token refresh)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        await clearAllApplicationData();
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false
        });
      } else {
        set({ 
          user: session.user, 
          isAuthenticated: true,
          isLoading: false
        });
      }
    });
  },

  reset: () => set({ ...INITIAL_STATE, isLoading: false }),
}));

resetters.add(() => useAuthStore.getState().reset());

