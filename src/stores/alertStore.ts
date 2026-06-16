import { create } from "zustand";

interface Alert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  employeeId?: string;
  acknowledged: boolean;
  createdAt: string;
}

interface AlertState {
  alerts: Alert[];
  unacknowledgedCount: number;
  filters: { severity: string; type: string };
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id) => void;
  acknowledgeAll: () => void;
  deleteAlert: (id) => void;
  setFilters: (filters: Partial<AlertState["filters"]>) => void;
}

export const useAlertStore = create<AlertState>()((set) => ({
  alerts: [],
  unacknowledgedCount: 0,
  filters: { severity: "", type: "" },
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unacknowledgedCount: state.unacknowledgedCount + 1,
    })),
  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
      unacknowledgedCount: Math.max(0, state.unacknowledgedCount - 1),
    })),
  acknowledgeAll: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, acknowledged: true })),
      unacknowledgedCount: 0,
    })),
  deleteAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
      unacknowledgedCount: state.alerts.find((a) => a.id === id && !a.acknowledged)
        ? state.unacknowledgedCount - 1
        : state.unacknowledgedCount,
    })),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}));
