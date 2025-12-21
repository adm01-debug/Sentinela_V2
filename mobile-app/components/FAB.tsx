import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { icon: string; onPress: () => void; color?: string; }

export function FAB({ icon, onPress, color = '#6366f1' }: Props) {
  return (
    <TouchableOpacity style={[styles.fab, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  icon: { fontSize: 24, color: '#fff' },
});