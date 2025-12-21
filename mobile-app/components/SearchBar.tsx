import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { value: string; onChange: (text: string) => void; onSubmit?: () => void; placeholder?: string; }

export function SearchBar({ value, onChange, onSubmit, placeholder = 'Search...' }: Props) {
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={value} onChangeText={onChange} onSubmitEditing={onSubmit} placeholder={placeholder} returnKeyType='search' />
      {value.length > 0 && <TouchableOpacity onPress={() => onChange('')}><Text style={styles.clear}>×</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 10, fontSize: 16 },
  clear: { fontSize: 20, color: '#999', padding: 4 },
});