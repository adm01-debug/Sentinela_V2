import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface ButtonProps { children?: React.ReactNode; onPress?: () => void; }

export function Button({ children, onPress }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
