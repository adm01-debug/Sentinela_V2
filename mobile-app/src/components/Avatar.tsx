import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface AvatarProps { children?: React.ReactNode; onPress?: () => void; }

export function Avatar({ children, onPress }: AvatarProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
