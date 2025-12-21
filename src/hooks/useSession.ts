import { useState, useCallback } from 'react';
export function useSession<T>() {
  const [session, setSession] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const login = useCallback((data: T) => { setSession(data); setLoading(false); }, []);
  const logout = useCallback(() => { setSession(null); }, []);
  return { session, loading, login, logout, isAuthenticated: !!session };
}