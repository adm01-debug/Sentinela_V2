import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface AdminGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, redirectTo = '/dashboard' }) => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (error || !data?.length) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [user?.id]);

  if (isLoading || isAdmin === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!isAdmin) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
};

export default AdminGuard;
