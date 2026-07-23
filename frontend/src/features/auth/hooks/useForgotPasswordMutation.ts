import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../api/supabase';

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
  });
};
