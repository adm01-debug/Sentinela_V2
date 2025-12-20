// ============================================================
// UI COMPONENTS (re-exports from ui/)
// ============================================================
export * from './ui/alert';
export * from './ui/avatar';
export * from './ui/badge';
export * from './ui/button';
export * from './ui/card';
export * from './ui/checkbox';
export * from './ui/command';
export * from './ui/dialog';
export * from './ui/dropdown-menu';
export * from './ui/input';
export * from './ui/label';
export * from './ui/popover';
export * from './ui/progress';
export * from './ui/scroll-area';
export * from './ui/select';
export * from './ui/separator';
export * from './ui/sheet';
export * from './ui/skeleton';
export * from './ui/switch';
export * from './ui/table';
export * from './ui/tabs';
export * from './ui/textarea';
export * from './ui/toast';
export * from './ui/toaster';
export * from './ui/tooltip';

// UI utility components
export { ConfirmButton } from './ui/ConfirmButton';
export { EmptyState as UIEmptyState } from './ui/EmptyState';
export { FilterBar } from './ui/FilterBar';
export { GridList } from './ui/GridList';
export { IconButton } from './ui/IconButton';
export { LoadingSpinner } from './ui/LoadingSpinner';
export { PageContainer } from './ui/PageContainer';
export { SearchInput as UISearchInput } from './ui/SearchInput';
export { SimpleDataTable } from './ui/SimpleDataTable';
export { StatCard as UIStatCard } from './ui/StatCard';
export { StatusBadge as UIStatusBadge } from './ui/StatusBadge';

// ============================================================
// LAYOUT COMPONENTS
// ============================================================
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { PageHeader, PageHeaderWithTabs, PageHeaderWithBreadcrumbs } from './PageHeader';
export { NavLink } from './NavLink';

// ============================================================
// DATA DISPLAY COMPONENTS
// ============================================================
export { DataTable, SortableHeader, getSelectionColumn } from './DataTable';
export { StatCard, StatCardsGrid, CountStatCard, PercentStatCard, CurrencyStatCard } from './StatCard';
export { StatusBadge, ActiveBadge, InactiveBadge, PendingBadge, ErrorBadge, OnlineBadge, OfflineBadge } from './StatusBadge';
export { UserAvatar, AvatarGroup, AvatarWithName } from './UserAvatar';
export { Pagination } from './Pagination';
export { VirtualList } from './VirtualList';
export { TimeAgo } from './TimeAgo';
export { ProgressBar } from './ProgressBar';
export { CustomTooltip } from './CustomTooltip';

// ============================================================
// FORM COMPONENTS
// ============================================================
export { InputField, TextareaField, SelectField, CheckboxField, SwitchField } from './FormField';
export { SearchInput, DebouncedSearchInput, SearchWithSuggestions } from './SearchInput';
export { DateRangePicker } from './DateRangePicker';

// ============================================================
// CHART COMPONENTS
// ============================================================
export { ActivityChart } from './ActivityChart';
export { ActivityHeatmap } from './ActivityHeatmap';
export { ActivityTimeline } from './ActivityTimeline';
export { AlertsChart } from './AlertsChart';
export { ProductivityChart } from './ProductivityChart';
export { ViolationsTrendChart } from './ViolationsTrendChart';
export { ViolationsByTypeChart } from './ViolationsByTypeChart';
export { ViolationsBySeverityChart } from './ViolationsBySeverityChart';
export { ViolationsByEmployeeChart } from './ViolationsByEmployeeChart';
export { RateLimitTrendsCharts } from './RateLimitTrendsCharts';

// ============================================================
// CARD COMPONENTS
// ============================================================
export { ActivityStatsCards } from './ActivityStatsCards';
export { ApplicationCard } from './ApplicationCard';
export { KeystrokeActivityCard } from './KeystrokeActivityCard';
export { LiveViewCard } from './LiveViewCard';
export { ProductivityCard } from './ProductivityCard';
export { RealtimeClicksCard } from './RealtimeClicksCard';
export { RealtimeKeystrokesCard } from './RealtimeKeystrokesCard';
export { ScreenCapturesCard } from './ScreenCapturesCard';
export { SecurityMetrics } from './SecurityMetrics';

// ============================================================
// FEEDBACK COMPONENTS
// ============================================================
export { ErrorBoundary, withErrorBoundary, useErrorHandler, PageErrorBoundary } from './ErrorBoundary';
export { QueryErrorBoundary } from './QueryErrorBoundary';
export { 
  Spinner, 
  FullPageLoading, 
  InlineLoading, 
  CardLoading, 
  TableLoading, 
  StatsCardsLoading, 
  ListLoading, 
  ChartLoading,
  LoadingState 
} from './LoadingState';
export { 
  EmptyState, 
  SearchEmptyState, 
  NoDataEmptyState, 
  ErrorEmptyState 
} from './EmptyState';
export { 
  ConfirmDialog, 
  ConfirmDialogProvider, 
  useConfirmDialog, 
  DeleteConfirmDialog 
} from './ConfirmDialog';
export { NotificationsDropdown } from './NotificationsDropdown';
export { NotificationsPanel } from './NotificationsPanel';

// ============================================================
// SKELETON COMPONENTS
// ============================================================
export { DashboardSkeleton } from './DashboardSkeleton';
export * from './PageSkeletons';

// ============================================================
// NAVIGATION COMPONENTS
// ============================================================
export { CommandPalette } from './CommandPalette';
export { LanguageSwitcher } from './LanguageSwitcher';

// ============================================================
// AUTH/ACCESS COMPONENTS
// ============================================================
export { ProtectedRoute } from './ProtectedRoute';
export { PermissionGate } from './PermissionGate';
export { PolicyGate } from './PolicyGate';
export { MFAEnroll } from './MFAEnroll';
export { MFAVerify } from './MFAVerify';
export { MFASettings } from './MFASettings';

// ============================================================
// DIALOG COMPONENTS
// ============================================================
export { AddApplicationDialog } from './AddApplicationDialog';
export { EditApplicationDialog } from './EditApplicationDialog';
export { PolicyAcknowledgmentDialog } from './PolicyAcknowledgmentDialog';

// ============================================================
// PANEL COMPONENTS
// ============================================================
export { AlertSettingsPanel } from './AlertSettingsPanel';
export { BlockedIPsPanel } from './BlockedIPsPanel';
export { RateLimitSettingsPanel } from './RateLimitSettingsPanel';
export { ViolationCommentsPanel } from './ViolationCommentsPanel';
export { SettingsAuditLog } from './SettingsAuditLog';
export { SavedFiltersBar } from './SavedFiltersBar';

// ============================================================
// MONITORING COMPONENTS
// ============================================================
export { MonitoringNotice } from './MonitoringNotice';
export { RealtimeActivityFilters } from './RealtimeActivityFilters';
export { ViolationsRealtimeTable } from './ViolationsRealtimeTable';
export { SessionPlayback } from './SessionPlayback';
export { SimulateViolationButton } from './SimulateViolationButton';
export { RateLimitRealtimeAlerts } from './RateLimitRealtimeAlerts';

// ============================================================
// MAP COMPONENTS
// ============================================================
export { LocationMap } from './LocationMap';
export { MobileDevicesMap } from './MobileDevicesMap';

// ============================================================
// MISC COMPONENTS
// ============================================================
export { AlertItem } from './AlertItem';
export { EmployeeAlertItem } from './EmployeeAlertItem';
export { EmployeeRow } from './EmployeeRow';
export { EmployeeViolationsRanking } from './EmployeeViolationsRanking';
export { ApplicationRuleRow } from './ApplicationRuleRow';
export { PolicyToggle } from './PolicyToggle';
export { DashboardCustomizer } from './DashboardCustomizer';
export { PWAInstallPrompt } from './PWAInstallPrompt';

// ============================================================
// UTILITY COMPONENTS
// ============================================================
export { ThemeProvider, useTheme } from './ThemeProvider';
export { ThemeToggle, ThemeToggleCompact } from './ThemeToggle';

// ============================================================
// ACCESSIBILITY COMPONENTS
// ============================================================
export * from './a11y';

// ============================================================
// DOMAIN COMPONENTS (re-exports from subdirectories)
// ============================================================
export * from './ai';
export * from './employees';
export * from './geofencing';
export * from './mobile';
export * from './monitoring';
export * from './policies';
export * from './productivity';
export * from './rules';
export * from './schedules';
export * from './teams';
export * from './templates';
export * from './violations';
export * from './webhooks';
export * from './whatsapp';
