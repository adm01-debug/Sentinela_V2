import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { StatCard } from '../components/StatCard';
import { AlertCard } from '../components/AlertCard';
import { useActivities } from '../hooks/useActivities';
import { useAlerts } from '../hooks/useAlerts';
export const DashboardScreen = () => {
  const { activities, isLoading: activitiesLoading, refetch: refetchActivities } = useActivities();
  const { alerts, isLoading: alertsLoading, acknowledgeAlert } = useAlerts();
  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 3);
  const stats = { employees: 150, active: 120, productivity: 85, alerts: alerts.filter(a => !a.acknowledged).length };
  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={activitiesLoading || alertsLoading} onRefresh={refetchActivities} />}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.statsGrid}>
        <StatCard title="Employees" value={stats.employees} />
        <StatCard title="Active" value={stats.active} />
        <StatCard title="Productivity" value={stats.productivity + '%'} trend={5} />
        <StatCard title="Alerts" value={stats.alerts} />
      </View>
      <Text style={styles.sectionTitle}>Recent Alerts</Text>
      {recentAlerts.map(alert => <AlertCard key={alert.id} alert={alert} onAcknowledge={() => acknowledgeAlert(alert.id)} />)}
    </ScrollView>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 }, statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }, sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 } });