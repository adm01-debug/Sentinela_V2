import { useColorScheme } from 'react-native';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    isDark,
    colors: {
      background: isDark ? '#000' : '#fff',
      text: isDark ? '#fff' : '#000',
      primary: '#007AFF',
    },
  };
}
