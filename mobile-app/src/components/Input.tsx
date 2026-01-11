import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface InputProps { children?: React.ReactNode; onPress?: () => void; }

export function Input({ children, onPress }: InputProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
