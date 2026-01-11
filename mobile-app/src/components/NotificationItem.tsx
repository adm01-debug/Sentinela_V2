import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
export const NotificationItem = ({ notification, onPress }) => (
  <TouchableOpacity style={[styles.item, !notification.read && styles.unread]} onPress={onPress}>
    <View style={styles.dot} />
    <View style={styles.content}>
      <Text style={styles.title}>{notification.title}</Text>
      <Text style={styles.message}>{notification.message}</Text>
      <Text style={styles.time}>{notification.createdAt}</Text>
    </View>
  </TouchableOpacity>
);
const styles = StyleSheet.create({ item: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }, unread: { backgroundColor: '#F0F7FF' }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF', marginRight: 12, marginTop: 6 }, content: { flex: 1 }, title: { fontWeight: '600', marginBottom: 4 }, message: { color: '#666', marginBottom: 4 }, time: { color: '#999', fontSize: 12 } });