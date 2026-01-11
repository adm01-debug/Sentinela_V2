import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
export const AlertCard = ({ alert, onAcknowledge }) => {
  const severityColors = { low: '#4CAF50', medium: '#FF9800', high: '#F44336', critical: '#9C27B0' };
  return (
    <View style={[styles.card, { borderLeftColor: severityColors[alert.severity] }]}>
      <View style={styles.header}><Text style={styles.title}>{alert.title}</Text><Text style={[styles.severity, { color: severityColors[alert.severity] }]}>{alert.severity}</Text></View>
      <Text style={styles.message}>{alert.message}</Text>
      {!alert.acknowledged && <TouchableOpacity style={styles.btn} onPress={onAcknowledge}><Text style={styles.btnText}>Acknowledge</Text></TouchableOpacity>}
    </View>
  );
};
const styles = StyleSheet.create({ card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }, header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, title: { fontWeight: '600', fontSize: 16 }, severity: { fontWeight: '500', textTransform: 'uppercase', fontSize: 12 }, message: { color: '#666', marginBottom: 12 }, btn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6, alignItems: 'center' }, btnText: { color: '#fff', fontWeight: '500' } });