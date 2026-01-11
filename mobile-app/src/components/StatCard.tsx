import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export const StatCard = ({ title, value, trend }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.value}>{value}</Text>
    {trend && <Text style={[styles.trend, trend > 0 ? styles.positive : styles.negative]}>{trend > 0 ? '+' : ''}{trend}%</Text>}
  </View>
);
const styles = StyleSheet.create({ card: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }, title: { color: '#666', fontSize: 12, marginBottom: 4 }, value: { fontSize: 24, fontWeight: 'bold' }, trend: { fontSize: 12, marginTop: 4 }, positive: { color: '#4CAF50' }, negative: { color: '#F44336' } });