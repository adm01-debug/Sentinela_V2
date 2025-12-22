import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface Props { children: React.ReactNode; style?: TextStyle; required?: boolean; }

export function Label({ children, style, required }: Props) {
  return <Text style={[styles.label, style]}>{children}{required && <Text style={styles.required}> *</Text>}</Text>;
}

const styles = StyleSheet.create({ label: { fontSize: 14, fontWeight: '600', marginBottom: 6 }, required: { color: '#ff4444' } });