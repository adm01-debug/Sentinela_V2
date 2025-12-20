import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// SIDEBAR STORE
// ============================================================

interface SidebarState {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);

// ============================================================
// GLOBAL FILTERS STORE
// ============================================================

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface GlobalFiltersState {
  dateRange: DateRange;
  employeeFilter: string | null;
  teamFilter: string | null;
  statusFilter: string | null;
  searchTerm: string;
  setDateRange: (range: DateRange) => void;
  setEmployeeFilter: (employeeId: string | null) => void;
  setTeamFilter: (teamId: string | null) => void;
  setStatusFilter: (status: string | null) => void;
  setSearchTerm: (term: string) => void;
  clearAllFilters: () => void;
}

export const useGlobalFiltersStore = create<GlobalFiltersState>()(
  persist(
    (set) => ({
      dateRange: { from: null, to: null },
      employeeFilter: null,
      teamFilter: null,
      statusFilter: null,
      searchTerm: '',
      setDateRange: (range) => set({ dateRange: range }),
      setEmployeeFilter: (employeeId) => set({ employeeFilter: employeeId }),
      setTeamFilter: (teamId) => set({ teamFilter: teamId }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      clearAllFilters: () => set({
        dateRange: { from: null, to: null },
        employeeFilter: null,
        teamFilter: null,
        statusFilter: null,
        searchTerm: '',
      }),
    }),
    {
      name: 'global-filters-storage',
    }
  )
);

// ============================================================
// NOTIFICATIONS STORE
// ============================================================

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50
          unreadCount: state.unreadCount + 1,
        }));
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          };
        });
      },
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'notifications-storage',
    }
  )
);

// ============================================================
// USER PREFERENCES STORE
// ============================================================

interface UserPreferencesState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  defaultView: 'grid' | 'list';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setCompactMode: (compact: boolean) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  setDefaultView: (view: 'grid' | 'list') => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'pt-BR',
      compactMode: false,
      autoRefresh: true,
      refreshInterval: 30,
      defaultView: 'grid',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setDefaultView: (defaultView) => set({ defaultView }),
    }),
    {
      name: 'user-preferences-storage',
    }
  )
);

// ============================================================
// AUTH STATE STORE (for client-side state sync)
// ============================================================

interface AuthStateStore {
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  setAuth: (userId: string, email: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStateStore = create<AuthStateStore>()((set) => ({
  isAuthenticated: false,
  userId: null,
  userEmail: null,
  userRole: null,
  setAuth: (userId, email, role) =>
    set({ isAuthenticated: true, userId, userEmail: email, userRole: role }),
  clearAuth: () =>
    set({ isAuthenticated: false, userId: null, userEmail: null, userRole: null }),
}));

// ============================================================
// DASHBOARD LAYOUT STORE
// ============================================================

interface DashboardLayoutState {
  visibleWidgets: string[];
  widgetOrder: string[];
  toggleWidget: (widgetId: string) => void;
  reorderWidgets: (newOrder: string[]) => void;
  resetLayout: () => void;
}

const DEFAULT_WIDGETS = ['stats', 'violations', 'activity', 'productivity'];

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set) => ({
      visibleWidgets: DEFAULT_WIDGETS,
      widgetOrder: DEFAULT_WIDGETS,
      toggleWidget: (widgetId) =>
        set((state) => ({
          visibleWidgets: state.visibleWidgets.includes(widgetId)
            ? state.visibleWidgets.filter((id) => id !== widgetId)
            : [...state.visibleWidgets, widgetId],
        })),
      reorderWidgets: (newOrder) => set({ widgetOrder: newOrder }),
      resetLayout: () => set({ visibleWidgets: DEFAULT_WIDGETS, widgetOrder: DEFAULT_WIDGETS }),
    }),
    {
      name: 'dashboard-layout-storage',
    }
  )
);
