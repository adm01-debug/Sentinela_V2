import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useActivities } from '../hooks/useActivities';
import { ActivityItem } from '../components/ActivityItem';
export const ActivityScreen = () => {
  const { activities, isLoading, refetch } = useActivities();
  if (isLoading) return <View style={styles.center}><Text>Loading...</Text></View>;
  return (
    <View style={styles.container}>
      <FlatList data={activities} keyExtractor={(item) => item.id} renderItem={({ item }) => <ActivityItem activity={item} />} onRefresh={refetch} refreshing={isLoading} />
    </View>
  );
};
const styles = StyleSheet.create({ container: { flex: 1 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' } });