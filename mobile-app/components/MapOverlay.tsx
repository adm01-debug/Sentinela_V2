import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props { children: React.ReactNode; style?: ViewStyle; }

export function MapOverlay({ children, style }: Props) {
  return <View style={[styles.overlay, style]}>{children}</View>;
}

const styles = StyleSheet.create({ overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' } });