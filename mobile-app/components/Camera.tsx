import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface Props { onCapture: (uri: string) => void; onClose: () => void; }

export function Camera({ onCapture, onClose }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => onCapture('photo.jpg')}>
        <Text style={styles.text}>Capture</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose}><Text>Close</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff' },
  text: { textAlign: 'center' },
});