import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

interface Props { value: number; onChange: (value: number) => void; currency?: string; }

export function CurrencyInput({ value, onChange, currency = 'R$' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.currency}>{currency}</Text>
      <TextInput style={styles.input} value={value.toFixed(2)} keyboardType='decimal-pad' onChangeText={t => onChange(parseFloat(t) || 0)} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 }, currency: { marginRight: 5, fontSize: 16 }, input: { flex: 1, fontSize: 16 } });