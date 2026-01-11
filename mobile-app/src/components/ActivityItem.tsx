import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export const ActivityItem = ({ activity }) => (
  <View style={styles.container}>
    <View style={styles.icon} />
    <View style={styles.content}>
      <Text style={styles.type}>{activity.type}</Text>
      <Text style={styles.app}>{activity.application}</Text>
      <Text style={styles.time}>{activity.timestamp}</Text>
    </View>
  </View>
);
const styles = StyleSheet.create({ container: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }, icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', marginRight: 12 }, content: { flex: 1 }, type: { fontWeight: '600' }, app: { color: '#666' }, time: { color: '#999', fontSize: 12 } });