import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props { children: React.ReactNode; style?: ViewStyle; padding?: number; }

export function Container({ children, style, padding = 16 }: Props) {
  return <View style={[styles.container, { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#fff' } });