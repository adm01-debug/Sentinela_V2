import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ============================================================
// TYPES
// ============================================================

interface ActivityItem {
  id: string;
  type: 'location' | 'badge' | 'points' | 'violation' | 'checkin';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================================
// ACTIVITY ITEM COMPONENT
// ============================================================

function ActivityListItem({ item }: { item: ActivityItem }) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'location': return '📍';
      case 'badge': return '🏆';
      case 'points': return '⭐';
      case 'violation': return '⚠️';
      case 'checkin': return '✅';
      default: return '📋';
    }
  };

  const getColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'location': return '#3B82F6';
      case 'badge': return '#F59E0B';
      case 'points': return '#10B981';
      case 'violation': return '#EF4444';
      case 'checkin': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.iconContainer, { backgroundColor: getColor(item.type) + '20' }]}>
        <Text style={styles.icon}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>
          {formatDistanceToNow(new Date(item.timestamp), {
            addSuffix: true,
            locale: ptBR,
          })}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// FILTER TABS
// ============================================================

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'location', label: 'Local' },
  { id: 'badge', label: 'Badges' },
  { id: 'points', label: 'Pontos' },
];

// ============================================================
// MAIN SCREEN
// ============================================================

export default function ActivityScreen() {
  const { session } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch activity data
  const { data: activities = [], refetch, isLoading } = useQuery({
    queryKey: ['activity', session?.user?.id, activeFilter],
    queryFn: async () => {
      // Simulated activity data - in production, fetch from Supabase
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'checkin',
          title: 'Check-in realizado',
          description: 'Você fez check-in no escritório',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'points',
          title: '+50 pontos',
          description: 'Pontualidade da semana',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'badge',
          title: 'Nova conquista!',
          description: 'Você desbloqueou "Primeira Semana"',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '4',
          type: 'location',
          title: 'Área de trabalho',
          description: 'Entrada na geofence do escritório',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      if (activeFilter === 'all') {
        return mockActivities;
      }
      return mockActivities.filter(a => a.type === activeFilter);
    },
    enabled: !!session,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atividades</Text>
        <Text style={styles.headerSubtitle}>Seu histórico de ações</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              activeFilter === filter.id && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activity List */}
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityListItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Carregando...' : 'Nenhuma atividade encontrada'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
  },
});
