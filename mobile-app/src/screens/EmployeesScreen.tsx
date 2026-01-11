import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const employees = [{ id: '1', name: 'John Doe' }, { id: '2', name: 'Jane Smith' }];

export function EmployeesScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={employees}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <View style={styles.item}><Text>{item.name}</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
