import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';
import { useNavigate } from 'react-router-dom';

// Definimos la interfaz para tipar estrictamente los datos de entrada
interface RegisterCredentials {
  email: string;
  password: Record<string, any> | string; // Supabase acepta string para password convencional
}

export const useRegisterMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    // La función que ejecutará la llamada asíncrona a Supabase
    mutationFn: async ({ email, password }: RegisterCredentials) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password as string,
      });

      // Si Supabase devuelve un error (ej. email ya registrado, contraseña muy corta), lo lanzamos
      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    
    // Qué pasa si todo sale bien
    onSuccess: (data) => {
      console.log('Usuario registrado con éxito en Supabase:', data);
      
      // Nota Senior: Gracias al Trigger que armamos en la Base de Datos,
      // en este preciso milisegundo el usuario YA existe también en tu tabla de Prisma ("users").
      
      // Redireccionamos al dashboard de ConciliaFácil de inmediato
      navigate('/home'); 
    },

    // Qué pasa si ocurre un error
    onError: (error: Error) => {
      // Aquí podrías conectar un sistema de alertas tipo Toast (ej. Sonner o React Hot Toast)
      console.error('Error en el registro:', error.message);
    },
  });
};