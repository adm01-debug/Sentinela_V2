import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
export const AboutScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Sentinela</Text>
    <Text style={styles.version}>Version 1.0.0</Text>
    <Text style={styles.copyright}>© 2026 Sentinela</Text>
  </View>
);
const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 28, fontWeight: 'bold' }, version: { color: '#666' }, copyright: { color: '#999', marginTop: 32 } });