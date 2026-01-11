import { create } from 'zustand';

interface Activity {
  id: string;
  employeeId: string;
  type: string;
  application: string;
  timestamp: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

interface ActivityState {
  activities: Activity[];
  realtimeActivities: Activity[];
  dateRange: { start: string; end: string };
  isLoading: boolean;
  setActivities: (activities: Activity[]) => void;
  addRealtimeActivity: (activity: Activity) => void;
  clearRealtimeActivities: () => void;
  setDateRange: (start: string, end: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useActivityStore = create<ActivityState>()((set) => ({
  activities: [],
  realtimeActivities: [],
  dateRange: { start: '', end: '' },
  isLoading: false,
  setActivities: (activities) => set({ activities }),
  addRealtimeActivity: (activity) =>
    set((state) => ({
      realtimeActivities: [activity, ...state.realtimeActivities].slice(0, 100),
    })),
  clearRealtimeActivities: () => set({ realtimeActivities: [] }),
  setDateRange: (start, end) => set({ dateRange: { start, end } }),
  setLoading: (isLoading) => set({ isLoading }),
}));
