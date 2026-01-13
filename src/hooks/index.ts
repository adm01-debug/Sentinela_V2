// API hooks
export * from "./api";

// Auth & Permissions
export { useAuth, useLogin, useLogout, useCurrentUser, useUpdateProfile, useChangePassword, useSessions, useRevokeSession } from "./useAuth";
export { usePermissions, useUserPermissions, useHasPermission, useRoles } from "./usePermissions";
export { useFeatureFlags } from "./useFeatureFlags";
export { useSubscription } from "./useSubscription";
export { useAppConfig } from "./useAppConfig";

// Utility hooks
export { useDebounce } from "./useDebounce";
export { useLocalStorage } from "./useLocalStorage";
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
export { useForm } from "./useForm";
export { usePagination } from "./usePagination";
export { useSearch } from "./useSearch";
export { useSort } from "./useSort";
export { useFilter } from "./useFilter";

// Feature hooks
export { useAlerts } from "./useAlerts";
export { useEmployees } from "./useEmployees";
export { useActivities } from "./useActivities";
export { useReports } from "./useReports";
export { useDashboard } from "./useDashboard";
export { useSettings } from "./useSettings";
export { useNotifications } from "./useNotifications";
export { useAnalytics } from "./useAnalytics";
export { useAuditLog } from "./useAuditLog";
export { useTeams } from "./useTeams";
export { useGeofencing } from "./useGeofencing";

// A11y hooks
export { useA11y } from "./useA11y";
export { useAnnounce } from "./useAnnounce";
export { useFocusTrap } from "./useFocusTrap";
export { useReducedMotion } from "./useReducedMotion";
