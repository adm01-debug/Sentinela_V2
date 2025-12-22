import React from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet } from 'react-native';

interface Props { value: string; onChange: (value: string) => void; label?: string; placeholder?: string; error?: string; multiline?: boolean; }

export function TextInput({ value, onChange, label, placeholder, error, multiline }: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput style={[styles.input, error && styles.inputError, multiline && styles.multiline]} value={value} onChangeText={onChange} placeholder={placeholder} multiline={multiline} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({ container: { marginBottom: 16 }, label: { fontSize: 14, fontWeight: '600', marginBottom: 6 }, input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 }, inputError: { borderColor: '#ff4444' }, multiline: { height: 100, textAlignVertical: 'top' }, error: { color: '#ff4444', fontSize: 12, marginTop: 4 } });