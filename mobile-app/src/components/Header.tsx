import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface HeaderProps { children?: React.ReactNode; onPress?: () => void; }

export function Header({ children, onPress }: HeaderProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
