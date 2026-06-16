// Analytics Store for Sentinela v17
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface DateRange {
  start: string;
  end: string;
}

interface AnalyticsData {
  productivity: ProductivityData;
  applications: ApplicationData[];
  trends: TrendData[];
  summary: SummaryData;
}

interface ProductivityData {
  score: number;
  change: number;
  byDay: { date: string; score: number }[];
  byEmployee: { employeeId: string; score: number }[];
}

interface ApplicationData {
  id: string;
  name: string;
  category: string;
  totalTime: number;
  percentage: number;
  isProductive: boolean;
}

interface TrendData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: "up" | "down" | "stable";
}

interface SummaryData {
  totalActiveTime: number;
  totalIdleTime: number;
  averageProductivity: number;
  topApplications: string[];
  alertsCount: number;
}

interface AnalyticsState {
  data: AnalyticsData | null;
  dateRange: DateRange;
  selectedMetrics: string[];
  groupBy: "day" | "week" | "month";
  compareMode: boolean;
  compareDateRange: DateRange | null;
  isLoading: boolean;
  error: string | null;

  setData: (data: AnalyticsData) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  setGroupBy: (groupBy: "day" | "week" | "month") => void;
  setCompareMode: (enabled: boolean) => void;
  setCompareDateRange: (range: DateRange | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const today = new Date().toISOString().split("T")[0];
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const initialState = {
  data: null,
  dateRange: { start: lastWeek, end: today },
  selectedMetrics: ["productivity", "activeTime", "applications"],
  groupBy: "day" as const,
  compareMode: false,
  compareDateRange: null,
  isLoading: false,
  error: null,
};

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setData: (data) => set({ data }),

        setDateRange: (dateRange) => set({ dateRange }),

        setSelectedMetrics: (selectedMetrics) => set({ selectedMetrics }),

        setGroupBy: (groupBy) => set({ groupBy }),

        setCompareMode: (compareMode) => set({ compareMode }),

        setCompareDateRange: (compareDateRange) => set({ compareDateRange }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        reset: () => set(initialState),
      }),
      {
        name: "analytics-store",
        partialize: (state) => ({
          dateRange: state.dateRange,
          selectedMetrics: state.selectedMetrics,
          groupBy: state.groupBy,
        }),
      }
    ),
    { name: "AnalyticsStore" }
  )
);
