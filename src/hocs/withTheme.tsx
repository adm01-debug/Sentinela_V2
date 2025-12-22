import { ComponentType } from 'react';
import { useTheme } from '@/hooks/useTheme';

export function withTheme<P extends object>(Component: ComponentType<P & { theme: string }>) {
  return function ThemedComponent(props: Omit<P, 'theme'>) {
    const { theme } = useTheme();
    return <Component {...(props as P)} theme={theme} />;
  };
}
