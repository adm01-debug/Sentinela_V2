import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();
export function TabNavigator() { return <Tab.Navigator><Tab.Screen name='Home' component={() => null} /></Tab.Navigator>; }