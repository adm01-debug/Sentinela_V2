import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) { apiClient.setToken(token); try { const u = await apiClient.get('/auth/me'); setUser(u); } catch {} }
      setIsLoading(false);
    })();
  }, []);
  const login = useCallback(async (email, password) => {
    const { token, user } = await apiClient.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', token);
    apiClient.setToken(token);
    setUser(user);
  }, []);
  const logout = useCallback(async () => { await AsyncStorage.removeItem('token'); apiClient.setToken(null); setUser(null); }, []);
  return <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};
export const useAuthContext = () => useContext(AuthContext);