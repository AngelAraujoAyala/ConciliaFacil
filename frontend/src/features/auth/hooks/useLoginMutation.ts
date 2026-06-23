import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../api/supabase'; // Ajusta la ruta a tu cliente de Supabase
import type { LoginCredentials } from '../types';

export const useLoginMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Redirección inmediata al dashboard protegido
      navigate('/home', { replace: true });
    },
  });
};