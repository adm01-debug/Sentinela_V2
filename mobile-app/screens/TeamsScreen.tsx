import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function TeamsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teams</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' }
});