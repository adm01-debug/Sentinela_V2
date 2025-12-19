import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, CACHE_TIMES } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// TYPES
// ============================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'attendance' | 'teamwork' | 'achievement' | 'special';
  points_required: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  created_at: string;
}

export interface EmployeeBadge {
  id: string;
  employee_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface EmployeePoints {
  id: string;
  employee_id: string;
  total_points: number;
  level: number;
  experience: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  employee_id: string;
  employee_name: string;
  total_points: number;
  level: number;
  badges_count: number;
  rank: number;
}

export interface PointTransaction {
  id: string;
  employee_id: string;
  points: number;
  reason: string;
  category: string;
  created_at: string;
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

async function fetchBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('points_required');

  if (error) throw error;
  return data || [];
}

async function fetchEmployeeBadges(employeeId: string): Promise<EmployeeBadge[]> {
  const { data, error } = await supabase
    .from('employee_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('employee_id', employeeId)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchEmployeePoints(employeeId: string): Promise<EmployeePoints | null> {
  const { data, error } = await supabase
    .from('employee_points')
    .select('*')
    .eq('employee_id', employeeId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function fetchLeaderboard(
  period: 'week' | 'month' | 'all' = 'month',
  limit = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('employee_points')
    .select(`
      employee_id,
      total_points,
      level,
      employee:employees(name)
    `)
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Add rank and badges count
  const withRanks = await Promise.all(
    (data || []).map(async (entry, index) => {
      const { count } = await supabase
        .from('employee_badges')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', entry.employee_id);

      return {
        employee_id: entry.employee_id,
        employee_name: entry.employee?.name || 'Unknown',
        total_points: entry.total_points,
        level: entry.level,
        badges_count: count || 0,
        rank: index + 1,
      };
    })
  );

  return withRanks;
}

async function fetchPointTransactions(
  employeeId: string,
  limit = 20
): Promise<PointTransaction[]> {
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ============================================================
// HOOKS - QUERIES
// ============================================================

export function useBadges() {
  return useQuery({
    queryKey: queryKeys.gamification.badges,
    queryFn: fetchBadges,
    staleTime: CACHE_TIMES.IMMUTABLE,
  });
}

export function useEmployeeBadges(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['gamification', 'badges', employeeId],
    queryFn: () => fetchEmployeeBadges(employeeId!),
    enabled: !!employeeId,
    staleTime: CACHE_TIMES.FREQUENT,
  });
}

export function useEmployeePoints(employeeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.gamification.points(employeeId!),
    queryFn: () => fetchEmployeePoints(employeeId!),
    enabled: !!employeeId,
    ...queryPresets.realtime,
  });
}

export function useLeaderboard(period: 'week' | 'month' | 'all' = 'month') {
  return useQuery({
    queryKey: queryKeys.gamification.leaderboard(period),
    queryFn: () => fetchLeaderboard(period),
    staleTime: CACHE_TIMES.FREQUENT,
  });
}

export function usePointTransactions(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['gamification', 'transactions', employeeId],
    queryFn: () => fetchPointTransactions(employeeId!),
    enabled: !!employeeId,
    staleTime: CACHE_TIMES.FREQUENT,
  });
}

// ============================================================
// HOOKS - MUTATIONS
// ============================================================

export function useAwardPoints() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      employeeId,
      points,
      reason,
      category = 'manual',
    }: {
      employeeId: string;
      points: number;
      reason: string;
      category?: string;
    }) => {
      // Create transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          employee_id: employeeId,
          points,
          reason,
          category,
        });

      if (transactionError) throw transactionError;

      // Update total points
      const { data: current } = await supabase
        .from('employee_points')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (current) {
        const newTotal = current.total_points + points;
        const newLevel = calculateLevel(newTotal);

        const { data, error } = await supabase
          .from('employee_points')
          .update({
            total_points: newTotal,
            level: newLevel,
            experience: newTotal % 1000,
          })
          .eq('employee_id', employeeId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('employee_points')
          .insert({
            employee_id: employeeId,
            total_points: points,
            level: 1,
            experience: points % 1000,
            current_streak: 0,
            longest_streak: 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.gamification.points(variables.employeeId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.gamification.leaderboard() 
      });
      toast({
        title: 'Pontos concedidos',
        description: `${variables.points} pontos foram adicionados.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao conceder pontos',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAwardBadge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      employeeId,
      badgeId,
    }: {
      employeeId: string;
      badgeId: string;
    }) => {
      // Check if already has badge
      const { data: existing } = await supabase
        .from('employee_badges')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('badge_id', badgeId)
        .single();

      if (existing) {
        throw new Error('Funcionário já possui este badge');
      }

      const { data, error } = await supabase
        .from('employee_badges')
        .insert({
          employee_id: employeeId,
          badge_id: badgeId,
        })
        .select(`
          *,
          badge:badges(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['gamification', 'badges', variables.employeeId] 
      });
      toast({
        title: '🏆 Badge concedido!',
        description: `Badge "${data.badge?.name}" foi desbloqueado.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao conceder badge',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateLevel(totalPoints: number): number {
  // Every 1000 points = 1 level
  return Math.floor(totalPoints / 1000) + 1;
}

export function getNextLevelPoints(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints);
  return currentLevel * 1000;
}

export function getLevelProgress(currentPoints: number): number {
  const pointsInLevel = currentPoints % 1000;
  return (pointsInLevel / 1000) * 100;
}

export function getRarityColor(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-500';
    case 'uncommon': return 'text-green-500';
    case 'rare': return 'text-blue-500';
    case 'epic': return 'text-purple-500';
    case 'legendary': return 'text-yellow-500';
    default: return 'text-gray-500';
  }
}
