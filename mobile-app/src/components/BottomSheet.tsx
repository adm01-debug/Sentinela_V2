import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface BottomSheetProps { children?: React.ReactNode; onPress?: () => void; }

export function BottomSheet({ children, onPress }: BottomSheetProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
});
