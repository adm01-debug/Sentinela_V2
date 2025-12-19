import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'productivity' | 'attendance' | 'security' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  is_secret: boolean;
}

export interface EmployeeBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface EmployeePoints {
  id: string;
  employee_id: string;
  total_points: number;
  current_month_points: number;
  current_week_points: number;
  level: number;
  experience: number;
  current_streak: number;
  best_streak: number;
  badges_count: number;
  ranking_position: number | null;
}

export interface LeaderboardEntry {
  employee_id: string;
  employee_name: string;
  department: string | null;
  total_points: number;
  level: number;
  badges_count: number;
  current_streak: number;
  position: number;
}

// Buscar badges de um funcionário
export function useEmployeeBadges(employeeId: string) {
  return useQuery({
    queryKey: ['employee-badges', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_badges')
        .select(\`
          id,
          badge_id,
          earned_at,
          badge:badges (*)
        \`)
        .eq('employee_id', employeeId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as unknown as EmployeeBadge[];
    },
    enabled: !!employeeId,
  });
}

// Buscar pontos de um funcionário
export function useEmployeePoints(employeeId: string) {
  return useQuery({
    queryKey: ['employee-points', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_points')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as EmployeePoints | null;
    },
    enabled: !!employeeId,
  });
}

// Buscar todos os badges disponíveis
export function useAllBadges() {
  return useQuery({
    queryKey: ['all-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('rarity');

      if (error) throw error;
      return data as Badge[];
    },
  });
}

// Leaderboard
export function useLeaderboard(period: 'week' | 'month' | 'all' = 'month', limit = 10) {
  return useQuery({
    queryKey: ['leaderboard', period, limit],
    queryFn: async () => {
      const pointsField = period === 'week' 
        ? 'current_week_points' 
        : period === 'month' 
          ? 'current_month_points' 
          : 'total_points';

      const { data, error } = await supabase
        .from('employee_points')
        .select(\`
          employee_id,
          total_points,
          current_month_points,
          current_week_points,
          level,
          badges_count,
          current_streak,
          employee:employees (name, department)
        \`)
        .order(pointsField, { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((entry, index) => ({
        employee_id: entry.employee_id,
        employee_name: entry.employee?.name || 'Desconhecido',
        department: entry.employee?.department,
        total_points: period === 'week' 
          ? entry.current_week_points 
          : period === 'month' 
            ? entry.current_month_points 
            : entry.total_points,
        level: entry.level,
        badges_count: entry.badges_count,
        current_streak: entry.current_streak,
        position: index + 1,
      })) as LeaderboardEntry[];
    },
  });
}

// Conceder badge manualmente (admin)
export function useAwardBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, badgeCode }: { employeeId: string; badgeCode: string }) => {
      const { data, error } = await supabase.rpc('award_badge', {
        p_employee_id: employeeId,
        p_badge_code: badgeCode,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-badges', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-points', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Adicionar pontos manualmente (admin)
export function useAddPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      points, 
      reason, 
      description 
    }: { 
      employeeId: string; 
      points: number; 
      reason: string; 
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc('add_employee_points', {
        p_employee_id: employeeId,
        p_points: points,
        p_reason: reason,
        p_description: description,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-points', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Helpers
export const rarityConfig = {
  common: { label: 'Comum', color: 'bg-gray-500', textColor: 'text-gray-500' },
  rare: { label: 'Raro', color: 'bg-blue-500', textColor: 'text-blue-500' },
  epic: { label: 'Épico', color: 'bg-purple-500', textColor: 'text-purple-500' },
  legendary: { label: 'Lendário', color: 'bg-amber-500', textColor: 'text-amber-500' },
};

export const categoryConfig = {
  productivity: { label: 'Produtividade', icon: '📊' },
  attendance: { label: 'Assiduidade', icon: '📅' },
  security: { label: 'Segurança', icon: '🛡️' },
  milestone: { label: 'Marco', icon: '🏆' },
};

export function getLevelProgress(experience: number, level: number): number {
  const currentLevelXP = (level - 1) * (level - 1) * 50;
  const nextLevelXP = level * level * 50;
  const xpForThisLevel = nextLevelXP - currentLevelXP;
  const xpProgress = experience;
  return Math.min(100, Math.round((xpProgress / xpForThisLevel) * 100));
}

export function getXPForNextLevel(level: number): number {
  return level * level * 50 - (level - 1) * (level - 1) * 50;
}
