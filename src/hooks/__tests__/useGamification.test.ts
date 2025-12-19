import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase
const mockSelect = vi.fn();
const mockRpc = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockLimit = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
    rpc: mockRpc,
  },
}));

import { supabase } from '@/integrations/supabase/client';
import { 
  useEmployeeBadges, 
  useEmployeePoints, 
  useLeaderboard, 
  useAllBadges,
  useAwardBadge,
  getLevelProgress,
  getXPForNextLevel,
  rarityConfig,
} from '../useGamification';

beforeEach(() => {
  vi.clearAllMocks();
  
  mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });
  mockEq.mockReturnValue({ single: mockSingle, order: mockOrder });
  mockOrder.mockReturnValue({ limit: mockLimit, data: [], error: null });
  mockLimit.mockReturnValue({ data: [], error: null });
  mockSingle.mockReturnValue({ data: null, error: null });
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEmployeeBadges', () => {
  it('should fetch employee badges', async () => {
    const mockBadges = [
      {
        id: '1',
        badge_id: 'badge-1',
        earned_at: '2024-01-15T10:00:00Z',
        badge: {
          id: 'badge-1',
          code: 'first_week',
          name: 'Primeira Semana',
          description: 'Completou sua primeira semana',
          icon: '📅',
          rarity: 'common',
          points: 20,
        },
      },
    ];

    mockOrder.mockReturnValue({ data: mockBadges, error: null });

    const { result } = renderHook(() => useEmployeeBadges('emp-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBadges);
  });

  it('should not fetch when employeeId is missing', () => {
    const { result } = renderHook(() => useEmployeeBadges(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useEmployeePoints', () => {
  it('should fetch employee points', async () => {
    const mockPoints = {
      id: 'points-1',
      employee_id: 'emp-123',
      total_points: 500,
      current_month_points: 100,
      current_week_points: 50,
      level: 5,
      experience: 150,
      current_streak: 7,
      best_streak: 14,
      badges_count: 3,
    };

    mockSingle.mockReturnValue({ data: mockPoints, error: null });

    const { result } = renderHook(() => useEmployeePoints('emp-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockPoints);
  });

  it('should handle employee without points', async () => {
    mockSingle.mockReturnValue({ data: null, error: { code: 'PGRST116' } });

    const { result } = renderHook(() => useEmployeePoints('new-emp'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
  });
});

describe('useLeaderboard', () => {
  it('should fetch monthly leaderboard by default', async () => {
    const mockLeaderboard = [
      {
        employee_id: 'emp-1',
        total_points: 1000,
        current_month_points: 300,
        level: 10,
        badges_count: 8,
        current_streak: 14,
        employee: { name: 'João Silva', department: 'TI' },
      },
      {
        employee_id: 'emp-2',
        total_points: 800,
        current_month_points: 250,
        level: 8,
        badges_count: 6,
        current_streak: 7,
        employee: { name: 'Maria Santos', department: 'RH' },
      },
    ];

    mockLimit.mockReturnValue({ data: mockLeaderboard, error: null });

    const { result } = renderHook(() => useLeaderboard('month', 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].position).toBe(1);
    expect(result.current.data?.[1].position).toBe(2);
  });

  it('should fetch weekly leaderboard', async () => {
    mockLimit.mockReturnValue({ data: [], error: null });

    const { result } = renderHook(() => useLeaderboard('week', 5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('useAllBadges', () => {
  it('should fetch all active badges', async () => {
    const mockBadges = [
      {
        id: 'b1',
        code: 'productivity_starter',
        name: 'Iniciante Produtivo',
        category: 'productivity',
        rarity: 'common',
        points: 10,
        is_active: true,
      },
      {
        id: 'b2',
        code: 'security_champion',
        name: 'Campeão da Segurança',
        category: 'security',
        rarity: 'legendary',
        points: 500,
        is_active: true,
      },
    ];

    mockOrder.mockReturnValue({ data: mockBadges, error: null });

    const { result } = renderHook(() => useAllBadges(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBadges);
  });
});

describe('useAwardBadge', () => {
  it('should award badge to employee', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });

    const { result } = renderHook(() => useAwardBadge(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        employeeId: 'emp-123',
        badgeCode: 'first_week',
      });
    });

    expect(mockRpc).toHaveBeenCalledWith('award_badge', {
      p_employee_id: 'emp-123',
      p_badge_code: 'first_week',
    });
  });
});

describe('Helper Functions', () => {
  describe('getLevelProgress', () => {
    it('should calculate progress correctly', () => {
      // Level 1: 0-50 XP, Level 2: 50-200 XP
      expect(getLevelProgress(25, 1)).toBe(50); // 25/50 = 50%
      expect(getLevelProgress(0, 1)).toBe(0);
      expect(getLevelProgress(50, 1)).toBe(100);
    });

    it('should cap at 100%', () => {
      expect(getLevelProgress(1000, 1)).toBe(100);
    });
  });

  describe('getXPForNextLevel', () => {
    it('should return correct XP requirements', () => {
      // Formula: level^2 * 50 - (level-1)^2 * 50
      expect(getXPForNextLevel(1)).toBe(50); // 1*50 - 0 = 50
      expect(getXPForNextLevel(2)).toBe(150); // 4*50 - 1*50 = 150
      expect(getXPForNextLevel(3)).toBe(250); // 9*50 - 4*50 = 250
    });
  });

  describe('rarityConfig', () => {
    it('should have all rarities configured', () => {
      expect(rarityConfig.common).toBeDefined();
      expect(rarityConfig.rare).toBeDefined();
      expect(rarityConfig.epic).toBeDefined();
      expect(rarityConfig.legendary).toBeDefined();
    });

    it('should have labels for all rarities', () => {
      expect(rarityConfig.common.label).toBe('Comum');
      expect(rarityConfig.legendary.label).toBe('Lendário');
    });
  });
});
