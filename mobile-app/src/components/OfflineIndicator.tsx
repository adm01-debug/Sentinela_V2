import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export const OfflineIndicator: React.FC<{ isOffline: boolean }> = ({ isOffline }) => {
  if (!isOffline) return null;
  return <View style={styles.container}><Text style={styles.text}>No Internet Connection</Text></View>;
};
const styles = StyleSheet.create({ container: { backgroundColor: '#ff4d4f', padding: 10 }, text: { color: '#fff', textAlign: 'center' } });
export default OfflineIndicator;
