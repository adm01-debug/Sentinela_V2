import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { value: string; onChange: (value: string) => void; placeholder?: string; }

export function PasswordInput({ value, onChange, placeholder = 'Password' }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={placeholder} secureTextEntry={!visible} />
      <TouchableOpacity onPress={() => setVisible(!visible)}><Text>{visible ? '🙈' : '👁️'}</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12 }, input: { flex: 1, padding: 12, fontSize: 16 } });