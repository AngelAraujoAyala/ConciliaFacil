import { useState } from 'react';
import { supabase } from '../../../api/supabase';

export const useGoogleLogin = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = async () => {
    setIsPending(true);
    setError(null);

    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirige al flujo de callback que creaste en tu archivo AuthCallback.tsx
        redirectTo: `${siteUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsPending(false);
    }
  };

  return { loginWithGoogle, isPending, error };
};