import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { value: string; onChange: (value: string) => void; placeholder?: string; onClear?: () => void; }

export function SearchInput({ value, onChange, placeholder = 'Search...', onClear }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={placeholder} />
      {value.length > 0 && <TouchableOpacity onPress={onClear}><Text>✕</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 12 }, icon: { marginRight: 8 }, input: { flex: 1, padding: 12, fontSize: 16 } });