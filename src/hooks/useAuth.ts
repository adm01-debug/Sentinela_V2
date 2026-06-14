import { useState } from 'react';
import { useAuth, type User } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export { useAuth };
export type { User };

// Re-export convenience hooks that use Supabase

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
