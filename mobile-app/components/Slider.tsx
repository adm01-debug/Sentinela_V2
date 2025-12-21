import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { value: number; min?: number; max?: number; onChange: (value: number) => void; }

export function Slider({ value, min = 0, max = 100, onChange }: Props) {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
        <View style={[styles.thumb, { left: `${percentage}%` }]} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  track: { flex: 1, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, position: 'relative' },
  fill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 2 },
  thumb: { position: 'absolute', width: 20, height: 20, backgroundColor: '#6366f1', borderRadius: 10, top: -8, marginLeft: -10 },
  value: { marginLeft: 10, fontSize: 14, color: '#666' },
});