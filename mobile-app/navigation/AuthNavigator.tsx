import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
export function AuthNavigator() { return <Stack.Navigator><Stack.Screen name='Login' component={() => null} /></Stack.Navigator>; }