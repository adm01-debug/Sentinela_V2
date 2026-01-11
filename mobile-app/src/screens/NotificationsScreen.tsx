import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from '../components/NotificationItem';
export const NotificationsScreen = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={markAllAsRead}><Text style={styles.markAll}>Mark all as read</Text></TouchableOpacity>
      <FlatList data={notifications} keyExtractor={(item) => item.id} renderItem={({ item }) => <NotificationItem notification={item} onPress={() => markAsRead(item.id)} />} />
    </View>
  );
};
const styles = StyleSheet.create({ container: { flex: 1 }, markAll: { padding: 16, color: '#007AFF', textAlign: 'right' } });