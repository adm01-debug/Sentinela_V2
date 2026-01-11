import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) { apiClient.setToken(token); const userData = await apiClient.get('/auth/me'); setUser(userData); }
      setIsLoading(false);
    };
    loadUser();
  }, []);
  const login = useCallback(async (email, password) => {
    const { token, user } = await apiClient.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', token);
    apiClient.setToken(token);
    setUser(user);
  }, []);
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token');
    apiClient.setToken(null);
    setUser(null);
  }, []);
  return { user, isLoading, login, logout, isAuthenticated: !!user };
};