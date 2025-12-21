import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';

interface Props { value: boolean; onChange: (value: boolean) => void; disabled?: boolean; }

export function Switch({ value, onChange, disabled }: Props) {
  return (
    <TouchableOpacity style={[styles.container, value && styles.active, disabled && styles.disabled]} onPress={() => !disabled && onChange(!value)}>
      <View style={[styles.thumb, value && styles.thumbActive]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 50, height: 30, borderRadius: 15, backgroundColor: '#e0e0e0', padding: 2, justifyContent: 'center' },
  active: { backgroundColor: '#6366f1' },
  disabled: { opacity: 0.5 },
  thumb: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff' },
  thumbActive: { alignSelf: 'flex-end' },
});