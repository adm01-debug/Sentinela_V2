// ============================================================
// HOOKS BARREL FILE - SENTINELA v20
// Export centralizado de todos os hooks
// ============================================================

// ============================================================
// API HOOKS
// ============================================================
export * from "./api";

// ============================================================
// AUTH & PERMISSIONS
// ============================================================
export { 
  useAuth, 
  useLogin, 
  useLogout, 
  useCurrentUser, 
  useUpdateProfile, 
  useChangePassword, 
  useSessions, 
  useRevokeSession 
} from "./useAuth";

export { 
  usePermissions, 
  useUserPermissions, 
  useHasPermission, 
  useRoles 
} from "./usePermissions";

export { useFeatureFlags } from "./useFeatureFlags";
export { useSubscription } from "./useSubscription";
export { useAppConfig } from "./useAppConfig";

// ============================================================
// DASHBOARD HOOKS
// ============================================================
export { 
  useDashboardStats, 
  useActivityChart, 
  useProductivityChart,
  useTopEmployees,
  useTopApplications 
} from "./useDashboard";

// ============================================================
// ENTITY HOOKS
// ============================================================
export * from "./useEmployees";
export * from "./useActivities";
export * from "./useAlerts";
export * from "./useReports";
export * from "./useTeams";
export * from "./useSettings";
export * from "./useNotifications";
export * from "./useAnalytics";
export * from "./useAuditLog";

// ============================================================
// UTILITY HOOKS
// ============================================================
export { useDebounce } from "./useDebounce";
export { useThrottle } from "./useThrottle";
export { useLocalStorage } from "./useLocalStorage";
export { useSessionStorage } from "./useSessionStorage";
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from "./useMediaQuery";
export { useAsync } from "./useAsync";
export { useOnlineStatus } from "./useOnlineStatus";
export { useClipboard } from "./useClipboard";
export { usePrevious } from "./usePrevious";
export { useWindowSize } from "./useWindowSize";
export { useClickOutside } from "./useClickOutside";
export { useKeyPress } from "./useKeyPress";
export { useHover } from "./useHover";
export { useIntersectionObserver } from "./useIntersectionObserver";
export { useScrollPosition } from "./useScrollPosition";
export { useInterval } from "./useInterval";
export { useTimeout } from "./useTimeout";
export { useToggle } from "./useToggle";
export { useCopyToClipboard } from "./useCopyToClipboard";
export { useEventListener } from "./useEventListener";
export { useMountedState } from "./useMountedState";
export { useUpdateEffect } from "./useUpdateEffect";
export { useFirstMountState } from "./useFirstMountState";

// ============================================================
// FORM HOOKS
// ============================================================
export { useForm } from "./useForm";
export { usePagination } from "./usePagination";
export { useSearch } from "./useSearch";
export { useSort } from "./useSort";
export { useFilter } from "./useFilter";

// ============================================================
// GEOFENCING
// ============================================================
export * from "./useGeofencing";

// ============================================================
// A11Y HOOKS
// ============================================================
export { useA11y } from "./useA11y";
export { useAnnounce } from "./useAnnounce";
export { useFocusTrap } from "./useFocusTrap";
export { useReducedMotion } from "./useReducedMotion";

// ============================================================
// RE-EXPORT DO AUTH CONTEXT (para retrocompatibilidade)
// ============================================================
export * from "./useAuthContext";
