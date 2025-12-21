import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props { color?: string; thickness?: number; margin?: number; }

export function Divider({ color = '#e0e0e0', thickness = 1, margin = 8 }: Props) {
  return <View style={[styles.divider, { backgroundColor: color, height: thickness, marginVertical: margin }]} />;
}

const styles = StyleSheet.create({ divider: { width: '100%' } });