import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { label: string; onPress?: () => void; onRemove?: () => void; selected?: boolean; }

export function Chip({ label, onPress, onRemove, selected }: Props) {
  return (
    <TouchableOpacity style={[styles.chip, selected && styles.selected]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      {onRemove && <Text style={styles.remove} onPress={onRemove}>×</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, margin: 4 },
  selected: { backgroundColor: '#6366f1' },
  label: { fontSize: 14 },
  remove: { marginLeft: 8, fontSize: 16 },
});