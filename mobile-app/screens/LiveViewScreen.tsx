import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function LiveViewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LiveView</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' }
});