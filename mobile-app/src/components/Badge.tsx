import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface BadgeProps { children?: React.ReactNode; onPress?: () => void; }

export function Badge({ children, onPress }: BadgeProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
