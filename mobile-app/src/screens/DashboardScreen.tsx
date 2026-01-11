import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.card}><Text>Employees: 150</Text></View>
      <View style={styles.card}><Text>Active: 142</Text></View>
      <View style={styles.card}><Text>Violations: 5</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 10, shadowOpacity: 0.1, shadowRadius: 5 },
});
