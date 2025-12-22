import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface Props { value: string; onChange: (value: string) => void; countryCode?: string; }

export function PhoneInput({ value, onChange, countryCode = '+55' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>{countryCode}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType='phone-pad' placeholder='Phone number' />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }, code: { paddingHorizontal: 12, fontSize: 16, borderRightWidth: 1, borderRightColor: '#ddd' }, input: { flex: 1, padding: 12, fontSize: 16 } });