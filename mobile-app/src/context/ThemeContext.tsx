import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ThemeContext = createContext(null);
const lightTheme = { primary: '#007AFF', background: '#FFFFFF', surface: '#F5F5F5', text: '#000000', textSecondary: '#666666', border: '#E0E0E0', error: '#F44336', success: '#4CAF50' };
const darkTheme = { primary: '#0A84FF', background: '#000000', surface: '#1C1C1E', text: '#FFFFFF', textSecondary: '#8E8E93', border: '#38383A', error: '#FF453A', success: '#32D74B' };
export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('system');
  const [theme, setTheme] = useState(lightTheme);
  useEffect(() => { AsyncStorage.getItem('theme').then(saved => saved && setMode(saved)); }, []);
  useEffect(() => {
    const resolved = mode === 'system' ? systemScheme : mode;
    setTheme(resolved === 'dark' ? darkTheme : lightTheme);
  }, [mode, systemScheme]);
  const setThemeMode = async (newMode) => { setMode(newMode); await AsyncStorage.setItem('theme', newMode); };
  return <ThemeContext.Provider value={{ theme, mode, setThemeMode, isDark: theme === darkTheme }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);