import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' }
});