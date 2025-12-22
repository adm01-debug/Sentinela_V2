import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeArea } from '../components/SafeArea';

export function ActivityScreen() {
  return (
    <SafeArea>
      <View style={styles.container}>
        <Text style={styles.title}>Activity</Text>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' }
});