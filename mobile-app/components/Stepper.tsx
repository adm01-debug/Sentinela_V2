import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props { value: number; min?: number; max?: number; onChange: (value: number) => void; }

export function Stepper({ value, min = 0, max = 100, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity style={styles.button} onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  button: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 18 },
  buttonText: { fontSize: 20, fontWeight: 'bold' },
  value: { marginHorizontal: 16, fontSize: 18 },
});