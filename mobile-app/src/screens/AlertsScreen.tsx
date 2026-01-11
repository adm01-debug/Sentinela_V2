import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCard } from '../components/AlertCard';
export const AlertsScreen = () => {
  const { alerts, isLoading, acknowledgeAlert } = useAlerts();
  return (
    <View style={styles.container}>
      <FlatList data={alerts} keyExtractor={(item) => item.id} renderItem={({ item }) => <AlertCard alert={item} onAcknowledge={() => acknowledgeAlert(item.id)} />} ListEmptyComponent={<Text style={styles.empty}>No alerts</Text>} />
    </View>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, empty: { textAlign: 'center', marginTop: 32, color: '#666' } });