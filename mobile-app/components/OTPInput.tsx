import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface Props { length?: number; onChange: (code: string) => void; }

export function OTPInput({ length = 6, onChange }: Props) {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = text;
    setValues(newValues);
    onChange(newValues.join(''));
    if (text && index < length - 1) inputs.current[index + 1]?.focus();
  };

  return (
    <View style={styles.container}>
      {values.map((v, i) => (
        <TextInput key={i} ref={r => { if (r) inputs.current[i] = r; }} style={styles.input} value={v} onChangeText={t => handleChange(t, i)} maxLength={1} keyboardType='number-pad' />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  input: { width: 45, height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, textAlign: 'center', fontSize: 20 },
});