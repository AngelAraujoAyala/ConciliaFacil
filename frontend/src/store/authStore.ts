import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: async () => {
    // 1. Validar si ya existe una sesión guardada localmente al cargar la app
    const { data: { session } } = await supabase.auth.getSession();
    
    set({ 
      user: session?.user ?? null, 
      isAuthenticated: !!session, 
      isLoading: false 
    });

    // 2. Escuchar cambios de estado en tiempo real (login, logout, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ 
        user: session?.user ?? null, 
        isAuthenticated: !!session,
        isLoading: false
      });
    });
  },
}));