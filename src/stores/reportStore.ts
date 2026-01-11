import { create } from 'zustand';

interface Report {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  downloadUrl?: string;
}

interface ReportState {
  reports: Report[];
  currentReport: Report | null;
  isGenerating: boolean;
  addReport: (report: Report) => void;
  updateReport: (id: string, data: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  setCurrentReport: (report: Report | null) => void;
  setGenerating: (generating: boolean) => void;
}

export const useReportStore = create<ReportState>()((set) => ({
  reports: [],
  currentReport: null,
  isGenerating: false,
  addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
  updateReport: (id, data) =>
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),
  deleteReport: (id) => set((state) => ({ reports: state.reports.filter((r) => r.id !== id) })),
  setCurrentReport: (report) => set({ currentReport: report }),
  setGenerating: (isGenerating) => set({ isGenerating }),
}));
