import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { onSuccess: () => void; onError: (error: string) => void; }

export function TouchID({ onSuccess, onError }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onSuccess}>
      <Text style={styles.text}>👆 Touch ID</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ button: { padding: 20, backgroundColor: '#007AFF', borderRadius: 10, alignItems: 'center' }, text: { color: '#fff', fontSize: 16 } });