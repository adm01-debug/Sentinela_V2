import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

interface LeaderboardEntry { id: string; employee_id: string; employee_name: string; avatar_url: string | null; points: number; level: number; badges: string[]; rank: number; }
interface Achievement { id: string; name: string; description: string; icon: string; points: number; unlocked_count: number; }

export function useGamificationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  const leaderboardQuery = useQuery({
    queryKey: queryKeys.gamification.leaderboard(period),
    queryFn: async () => {
      const { data, error } = await supabase.from('gamification_leaderboard').select('*').order('points', { ascending: false }).limit(20);
      if (error) throw error;
      return (data || []).map((e, i) => ({ ...e, rank: i + 1 })) as LeaderboardEntry[];
    },
  });

  const achievementsQuery = useQuery({
    queryKey: queryKeys.gamification.achievements,
    queryFn: async () => {
      const { data, error } = await supabase.from('achievements').select('*').order('points', { ascending: false });
      if (error) throw error;
      return data as Achievement[];
    },
  });

  const stats = useMemo(() => {
    const entries = leaderboardQuery.data || [];
    return {
      totalParticipants: entries.length,
      totalPoints: entries.reduce((sum, e) => sum + e.points, 0),
      topScore: entries[0]?.points || 0,
      avgScore: entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + e.points, 0) / entries.length) : 0,
    };
  }, [leaderboardQuery.data]);

  const awardPointsMutation = useMutation({
    mutationFn: async ({ employeeId, points }: { employeeId: string; points: number }) => {
      const { error } = await supabase.rpc('award_gamification_points', { p_employee_id: employeeId, p_points: points });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gamification.all });
      toast({ title: 'Pontos concedidos!' });
    },
  });

  return {
    leaderboard: leaderboardQuery.data || [],
    achievements: achievementsQuery.data || [],
    stats,
    period,
    isLoading: leaderboardQuery.isLoading,
    handlePeriodChange: useCallback((p: 'week' | 'month' | 'all') => setPeriod(p), []),
    handleAwardPoints: useCallback((employeeId: string, points: number) => awardPointsMutation.mutate({ employeeId, points }), [awardPointsMutation]),
  };
}
