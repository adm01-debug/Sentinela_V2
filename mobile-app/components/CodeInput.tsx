import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface Props { length: number; value: string; onChange: (value: string) => void; }

export function CodeInput({ length, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <TextInput key={i} style={styles.input} maxLength={1} value={value[i] || ''} keyboardType='number-pad' />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', justifyContent: 'space-between' }, input: { width: 45, height: 55, borderWidth: 2, borderColor: '#ddd', borderRadius: 10, textAlign: 'center', fontSize: 24 } });