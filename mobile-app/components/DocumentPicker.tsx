import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props { onSelect: (uri: string, name: string) => void; types?: string[]; }

export function DocumentPicker({ onSelect, types }: Props) {
  const pick = async () => { onSelect('file://doc.pdf', 'document.pdf'); };
  return (
    <TouchableOpacity style={styles.button} onPress={pick}>
      <Text style={styles.text}>📄 Select Document</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ button: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center' }, text: { fontSize: 16 } });