import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Props { label: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string; }

export function FormField({ label, value, onChange, error, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, error && styles.inputError]} value={value} onChangeText={onChange} placeholder={placeholder} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({ container: { marginBottom: 16 }, label: { fontSize: 14, fontWeight: '600', marginBottom: 8 }, input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 }, inputError: { borderColor: '#ff4444' }, error: { color: '#ff4444', fontSize: 12, marginTop: 4 } });