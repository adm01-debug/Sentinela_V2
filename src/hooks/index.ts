// ============================================================
// AUTHENTICATION & USER
// ============================================================
export { useAuth } from './useAuth';
export { usePermissions, useHasPermission } from './usePermissions';
export { useMFA, useMFAStatus, useMFAFactors, useEnrollMFA, useVerifyMFA, useUnenrollMFA } from './useMFA';

// ============================================================
// DATA FETCHING
// ============================================================
export { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from './useEmployees';
export { useTeams, useTeam, useCreateTeam, useUpdateTeam, useDeleteTeam } from './useTeams';
export { useSecurityViolations, useViolation, useCreateViolation, useUpdateViolation } from './useSecurityViolations';
export { useViolationRules, useViolationRule, useCreateViolationRule, useUpdateViolationRule } from './useViolationRules';
export { useViolationComments, useCreateViolationComment } from './useViolationComments';
export { useGeofences, useGeofence, useCreateGeofence, useUpdateGeofence, useDeleteGeofence } from './useGeofences';
export { useWorkSchedules, useCreateWorkSchedule, useUpdateWorkSchedule } from './useWorkSchedules';
export { useWebhooks, useWebhook, useCreateWebhook, useUpdateWebhook, useDeleteWebhook } from './useWebhooks';
export { useMessageTemplates, useCreateMessageTemplate, useUpdateMessageTemplate } from './useMessageTemplates';
export { useMobileDevices, useMobileDevice, useUpdateMobileDevice } from './useMobileDevices';
export { usePolicies, usePolicyAcknowledgments, usePendingAcknowledgments, usePolicyStats } from './usePolicyAcknowledgments';
export { useProductivityData, useProductivityStats, useDepartments } from './useProductivityComparison';

// ============================================================
// SETTINGS & CONFIG
// ============================================================
export { useAlertSettings, useUpdateAlertSettings } from './useAlertSettings';
export { useMonitoringSettings, useUpdateMonitoringSettings } from './useMonitoringSettings';
export { useWhatsAppSettings, useUpdateWhatsAppSettings, useTestWhatsAppConnection } from './useWhatsAppSettings';
export { useRateLimitSettings, useUpdateRateLimitSettings } from './useRateLimitSettings';
export { useRateLimitLogs, useRateLimitStats } from './useRateLimitLogs';

// ============================================================
// ACTIVITY & MONITORING
// ============================================================
export { useRealtimeActivity, useEmployeeActivity } from './useRealtimeActivity';
export { useActiveEmployees, useOnlineEmployees } from './useActiveEmployees';
export { useSecurityMetrics } from './useSecurityMetrics';

// ============================================================
// NOTIFICATIONS
// ============================================================
export { usePendingNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from './usePendingNotifications';
export { useOvertimeNotifications, useApproveOvertime, useRejectOvertime } from './useOvertimeNotifications';

// ============================================================
// REPORTS & EXPORT
// ============================================================
export { useScheduledReports, useCreateScheduledReport, useUpdateScheduledReport } from './useScheduledReports';
export { useExportData, useExportEmployees, useExportViolations } from './useExport';
export { useAuditLog, useAuditLogs } from './useAuditLog';

// ============================================================
// FILTERS & SAVED STATE
// ============================================================
export { useSavedFilters, useCreateSavedFilter, useDeleteSavedFilter, useSetDefaultFilter } from './useSavedFilters';
export { useDashboardLayout, useSaveDashboardLayout } from './useDashboardLayout';

// ============================================================
// INTERNET ACCESS
// ============================================================
export { useInternetAccessRules, useCreateInternetRule, useUpdateInternetRule, useDeleteInternetRule } from './useInternetAccess';
export { useBlockedIPs, useBlockIP, useUnblockIP } from './useBlockedIPs';

// ============================================================
// EXTERNAL SERVICES
// ============================================================
export { useMapboxToken } from './useMapbox';

// ============================================================
// UI UTILITIES
// ============================================================
export { useDebounce, useDebouncedCallback, useThrottle, useDebouncedState, useSearchDebounce } from './useDebounce';
export { useLocalStorage, useSessionStorage, useStorageState, useThemeStorage, useSidebarStorage, usePageSizeStorage, useColumnVisibilityStorage } from './useLocalStorage';
export { useMediaQuery, useIsSmScreen, useIsMdScreen, useIsLgScreen, useIsXlScreen, useIs2xlScreen, useIsMobile, useIsTablet, useIsDesktop, useBreakpoint, usePrefersDarkMode, usePrefersReducedMotion, usePrefersHighContrast, useIsPortrait, useIsLandscape, useCanHover, useIsTouchDevice, useResponsiveValue } from './useMediaQuery';
export { useOnClickOutside, useOnClickOutsideMultiple, useClickOutsideRef } from './useOnClickOutside';
export { useClipboard, useCopyToClipboard, useClipboardValue } from './useClipboard';
export { useKeyboardShortcut, useKeyboardShortcuts, useEscapeKey, useEnterKey, useSaveShortcut, useCommandPaletteShortcut, useHelpShortcut } from './useKeyboardShortcut';
export { useIntersectionObserver, useInView, useLazyLoad, useInfiniteScroll, useVisibilityTracking } from './useIntersectionObserver';
export { useDocumentTitle, usePageTitle, useTitleWithNotificationCount } from './useDocumentTitle';
export { useNetworkStatus, useIsOnline, useIsSlowConnection, useOnlineCallback, useOfflineDetector } from './useNetworkStatus';
export { useWindowSize, useWindowWidth, useWindowHeight, useAspectRatio, useWindowSizeClass, useElementSize } from './useWindowSize';
export { usePrevious, usePreviousDistinct, useHasChanged, useChangedProps, useFirstRender, useIsFirstRender, useUpdateEffect } from './usePrevious';
export { useToggle, useBoolean, useDisclosure, useMultipleDisclosure, useCycle } from './useToggle';
export { useInterval, useTimeout, useIntervalWhen, useCountdown, useCountUp, useStopwatch } from './useInterval';
export { useAsync, useAsyncCallback, useAsyncRetry } from './useAsync';

// ============================================================
// TOASTS & FEEDBACK
// ============================================================
export { useToast } from './use-toast';
