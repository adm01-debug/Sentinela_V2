import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { selected: boolean; onSelect: () => void; label?: string; }

export function RadioButton({ selected, onSelect, label }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <View style={[styles.outer, selected && styles.outerSelected]}><View style={[styles.inner, selected && styles.innerSelected]} /></View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center' }, outer: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' }, outerSelected: { borderColor: '#007AFF' }, inner: { width: 12, height: 12, borderRadius: 6 }, innerSelected: { backgroundColor: '#007AFF' }, label: { marginLeft: 10 } });