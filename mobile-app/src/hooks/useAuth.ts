import { useState, useCallback } from 'react';
import { saveToken, removeToken } from '@/services/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = useCallback(async (email: string, password: string) => {
    // API call here
    await saveToken('mock-token');
    setIsAuthenticated(true);
  }, []);
  
  const logout = useCallback(async () => {
    await removeToken();
    setIsAuthenticated(false);
  }, []);
  
  return { isAuthenticated, login, logout };
}
