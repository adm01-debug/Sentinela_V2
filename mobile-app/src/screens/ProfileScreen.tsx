import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { supabase } from '../lib/supabase';

// ============================================================
// SETTINGS ITEM COMPONENT
// ============================================================

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingsItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  rightElement,
  danger = false,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingsIconContainer}>
        <Text style={styles.settingsIcon}>{icon}</Text>
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingsSubtitle}>{subtitle}</Text>
        )}
      </View>
      {rightElement}
      {onPress && !rightElement && (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================================
// STAT CARD COMPONENT
// ============================================================

function StatCard({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | number; 
  icon: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { isTracking, startTracking, stopTracking } = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      // Mock data - replace with actual Supabase query
      return {
        points: 1250,
        badges: 8,
        streak: 14,
        level: 5,
      };
    },
    enabled: !!user,
  });

  const handleSignOut = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      Alert.alert(
        'Pausar rastreamento',
        'Deseja pausar o rastreamento de localização?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Pausar', 
            onPress: stopTracking,
          },
        ]
      );
    } else {
      startTracking();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.user_metadata?.name || 'Usuário'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Nível {stats?.level || 1}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="⭐" value={stats?.points || 0} label="Pontos" />
          <StatCard icon="🏆" value={stats?.badges || 0} label="Badges" />
          <StatCard icon="🔥" value={stats?.streak || 0} label="Streak" />
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monitoramento</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem
              icon="📍"
              title="Rastreamento GPS"
              subtitle={isTracking ? 'Ativo' : 'Inativo'}
              rightElement={
                <Switch
                  value={isTracking}
                  onValueChange={handleToggleTracking}
                  trackColor={{ false: '#3E3E3E', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingsItem
              icon="🔔"
              title="Notificações"
              subtitle="Alertas e lembretes"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#3E3E3E', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem
              icon="👤"
              title="Editar perfil"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
            <SettingsItem
              icon="🔒"
              title="Alterar senha"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
            <SettingsItem
              icon="📊"
              title="Meus dados"
              subtitle="Exportar ou excluir"
              onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.settingsGroup}>
            <SettingsItem
              icon="📱"
              title="Versão do app"
              subtitle="1.0.0 (build 1)"
            />
            <SettingsItem
              icon="📄"
              title="Termos de uso"
              onPress={() => Alert.alert('Termos', 'Abre os termos de uso')}
            />
            <SettingsItem
              icon="🔐"
              title="Política de privacidade"
              onPress={() => Alert.alert('Privacidade', 'Abre a política')}
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={styles.settingsGroup}>
            <SettingsItem
              icon="🚪"
              title="Sair da conta"
              danger
              onPress={handleSignOut}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sentinela © 2024</Text>
          <Text style={styles.footerText}>Promo Brindes</Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingsGroup: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsIcon: {
    fontSize: 18,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  settingsSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  chevron: {
    fontSize: 20,
    color: '#64748B',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
});
