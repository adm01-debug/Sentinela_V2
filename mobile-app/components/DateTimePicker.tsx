import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { value: Date; onChange: (date: Date) => void; mode?: 'date' | 'time' | 'datetime'; }

export function DateTimePicker({ value, onChange, mode = 'datetime' }: Props) {
  return (
    <TouchableOpacity style={styles.container}>
      <Text>{value.toLocaleString()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ container: { padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 } });