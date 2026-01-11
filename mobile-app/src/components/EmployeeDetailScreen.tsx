import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useEmployee } from '../hooks/useEmployee';
export const EmployeeDetailScreen = () => {
  const route = useRoute();
  const { employee, isLoading } = useEmployee(route.params?.id);
  if (isLoading) return <View style={styles.center}><Text>Loading...</Text></View>;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: employee?.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{employee?.name}</Text>
        <Text style={styles.role}>{employee?.role}</Text>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({ container: { flex: 1 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, header: { alignItems: 'center', padding: 24 }, avatar: { width: 80, height: 80, borderRadius: 40 }, name: { fontSize: 20, fontWeight: 'bold' }, role: { color: '#666' } });