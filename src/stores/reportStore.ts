import { create } from 'zustand';

type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';
type ReportFormat = 'pdf' | 'csv' | 'xlsx';

interface Report {
  id: string;
  name: string;
  type: string;
  status: ReportStatus;
  format: ReportFormat;
  parameters: Record<string, unknown>;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface ReportState {
  reports: Report[];
  currentReport: Report | null;
  loading: boolean;
  error: string | null;
}

interface ReportActions {
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  removeReport: (id: string) => void;
  setCurrentReport: (report: Report | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ReportStore = ReportState & ReportActions;

const initialState: ReportState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
};

export const useReportStore = create<ReportStore>((set) => ({
  ...initialState,

  setReports: (reports) => set({ reports, error: null }),

  addReport: (report) =>
    set((state) => ({ reports: [report, ...state.reports] })),

  updateReport: (id, updates) =>
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  removeReport: (id) =>
    set((state) => ({
      reports: state.reports.filter((r) => r.id !== id),
    })),

  setCurrentReport: (currentReport) => set({ currentReport }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export type { Report, ReportStatus, ReportFormat, ReportState };
