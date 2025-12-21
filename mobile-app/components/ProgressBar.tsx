import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props { progress: number; color?: string; height?: number; }

export function ProgressBar({ progress, color = '#6366f1', height = 8 }: Props) {
  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.progress, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 4 },
});