import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { supabase } from '../lib/supabase';

export function HomeScreen() {
  const { user } = useAuth();
  const { location, isTracking, error: locationError } = useLocation();

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['employee-stats', user?.id],
    queryFn: async () => {
      // Buscar estatísticas do funcionário
      const { data, error } = await supabase
        .from('employee_points')
        .select('*')
        .eq('employee_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: violations } = useQuery({
    queryKey: ['my-violations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('id, violation_type, severity, created_at')
        .eq('employee_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.email?.split('@')[0]}!</Text>
        <Text style={styles.subtitle}>Bem-vindo ao Sentinela</Text>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={isTracking ? 'location' : 'location-outline'} 
            size={24} 
            color={isTracking ? '#22c55e' : '#6b7280'} 
          />
          <Text style={styles.statusTitle}>
            {isTracking ? 'Monitoramento Ativo' : 'Monitoramento Inativo'}
          </Text>
        </View>
        {location && (
          <Text style={styles.statusSubtitle}>
            Última atualização: {new Date().toLocaleTimeString()}
          </Text>
        )}
        {locationError && (
          <Text style={styles.errorText}>{locationError}</Text>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={32} color="#f59e0b" />
          <Text style={styles.statValue}>{stats?.total_points || 0}</Text>
          <Text style={styles.statLabel}>Pontos</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={32} color="#8b5cf6" />
          <Text style={styles.statValue}>{stats?.level || 1}</Text>
          <Text style={styles.statLabel}>Nível</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={32} color="#ef4444" />
          <Text style={styles.statValue}>{stats?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Recent Violations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alertas Recentes</Text>
        {violations && violations.length > 0 ? (
          violations.map((v) => (
            <View key={v.id} style={styles.violationItem}>
              <Ionicons 
                name="warning" 
                size={20} 
                color={v.severity === 'critical' ? '#ef4444' : v.severity === 'high' ? '#f59e0b' : '#6b7280'} 
              />
              <View style={styles.violationInfo}>
                <Text style={styles.violationType}>{v.violation_type}</Text>
                <Text style={styles.violationDate}>
                  {new Date(v.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            <Text style={styles.emptyText}>Nenhum alerta recente!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#3b82f6',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  violationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  violationInfo: {
    flex: 1,
  },
  violationType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  violationDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});
