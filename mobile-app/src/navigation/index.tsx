import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

export function Navigation() {
  const { isAuthenticated } = useAuth();
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
