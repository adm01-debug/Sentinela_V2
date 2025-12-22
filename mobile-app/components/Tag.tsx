import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { label: string; color?: string; onRemove?: () => void; }

export function Tag({ label, color = '#e0e0e0', onRemove }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      {onRemove && <TouchableOpacity onPress={onRemove}><Text style={styles.remove}>×</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 }, label: { fontSize: 14 }, remove: { marginLeft: 6, fontSize: 18 } });