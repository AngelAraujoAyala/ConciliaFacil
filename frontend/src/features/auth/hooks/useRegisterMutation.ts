import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import type { RegisterCredentials } from '../types';

export const useRegisterMutation = () => {

  return useMutation({
    // La función que ejecutará la llamada asíncrona a Supabase
    mutationFn: async ({ email, password }: RegisterCredentials) => {
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectTo = `${siteUrl}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password as string,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      // Si Supabase devuelve un error (ej. email ya registrado, contraseña muy corta), lo lanzamos
      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    
    onSuccess: (data) => {
      console.log('Usuario registrado con éxito en Supabase:', data);
    },

    onError: (error: Error) => {
      console.error('Error en el registro:', error.message);
    },
  });
};