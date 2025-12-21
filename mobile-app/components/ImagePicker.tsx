import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

interface Props { value?: string; onChange: (uri: string) => void; }

export function ImagePicker({ value, onChange }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onChange('selected.jpg')}>
      {value ? <Image source={{ uri: value }} style={styles.image} /> : <Text>Select Image</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 100, height: 100, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', borderRadius: 8 },
});