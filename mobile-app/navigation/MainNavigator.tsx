import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
export function MainNavigator() { return <Stack.Navigator><Stack.Screen name='Home' component={() => null} /></Stack.Navigator>; }