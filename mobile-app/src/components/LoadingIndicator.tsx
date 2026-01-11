import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface LoadingIndicatorProps { children?: React.ReactNode; onPress?: () => void; }

export function LoadingIndicator({ children, onPress }: LoadingIndicatorProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
