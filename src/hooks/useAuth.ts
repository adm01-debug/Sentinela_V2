import { useAuth } from '@/providers/AuthProvider';

export { useAuth };

// Re-export convenience hooks that use Supabase
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUpdateProfile = () => {
  const [isPending, setIsPending] = useState(false);
  return {
    mutateAsync: async (data: Record<string, unknown>) => {
      setIsPending(true);
      try {
        const { error } = await supabase.auth.updateUser({ data });
        if (error) throw error;
      } finally {
        setIsPending(false);
      }
    },
    isPending,
  };
};

export const useChangePassword = () => {
  const [isPending, setIsPending] = useState(false);
  return {
    mutateAsync: async ({ newPassword }: { currentPassword: string; newPassword: string }) => {
      setIsPending(true);
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      } finally {
        setIsPending(false);
      }
    },
    isPending,
  };
};

export default useAuth;
