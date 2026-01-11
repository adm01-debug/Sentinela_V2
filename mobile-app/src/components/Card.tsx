import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface CardProps { children?: React.ReactNode; onPress?: () => void; }

export function Card({ children, onPress }: CardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
