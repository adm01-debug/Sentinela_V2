import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface Props { value: string; onChange: (value: string) => void; mask: string; placeholder?: string; }

export function MaskedInput({ value, onChange, mask, placeholder }: Props) {
  const applyMask = (text: string) => { let result = ''; let textIndex = 0; for (let i = 0; i < mask.length && textIndex < text.length; i++) { if (mask[i] === '#') { result += text[textIndex++]; } else { result += mask[i]; } } return result; };
  return <TextInput style={styles.input} value={applyMask(value)} onChangeText={t => onChange(t.replace(/\D/g, ''))} placeholder={placeholder} />;
}

const styles = StyleSheet.create({ input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 } });