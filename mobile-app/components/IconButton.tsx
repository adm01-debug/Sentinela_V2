import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { icon: string; onPress: () => void; size?: number; color?: string; }

export function IconButton({ icon, onPress, size = 24, color = '#000' }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={[styles.icon, { fontSize: size, color }]}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ button: { padding: 8 }, icon: {} });