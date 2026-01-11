import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
export const SearchResultItem = ({ item }) => {
  const navigation = useNavigation();
  const handlePress = () => { if (item.type === 'employee') navigation.navigate('EmployeeDetail', { id: item.id }); };
  return (
    <TouchableOpacity style={styles.item} onPress={handlePress}>
      <Text style={styles.type}>{item.type}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({ item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }, type: { fontSize: 10, color: '#007AFF', textTransform: 'uppercase', marginBottom: 2 }, title: { fontWeight: '600', marginBottom: 2 }, subtitle: { color: '#666', fontSize: 14 } });