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

// ============================================================
// LAYOUT COMPONENTS
// ============================================================
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { PageHeader, PageHeaderWithTabs, PageHeaderWithBreadcrumbs } from './PageHeader';

// ============================================================
// DATA DISPLAY COMPONENTS
// ============================================================
export { DataTable, SortableHeader, getSelectionColumn } from './DataTable';
export { StatCard, StatCardsGrid, CountStatCard, PercentStatCard, CurrencyStatCard } from './StatCard';
export { StatusBadge, ActiveBadge, InactiveBadge, PendingBadge, ErrorBadge, OnlineBadge, OfflineBadge } from './StatusBadge';
export { UserAvatar, AvatarGroup, AvatarWithName } from './UserAvatar';
export { Pagination } from './Pagination';

// ============================================================
// FORM COMPONENTS
// ============================================================
export { InputField, TextareaField, SelectField, CheckboxField, SwitchField } from './FormField';
export { SearchInput, DebouncedSearchInput, SearchWithSuggestions } from './SearchInput';
export { DateRangePicker } from './DateRangePicker';

// ============================================================
// FEEDBACK COMPONENTS
// ============================================================
export { ErrorBoundary, withErrorBoundary, useErrorHandler } from './ErrorBoundary';
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

// ============================================================
// NAVIGATION COMPONENTS
// ============================================================
export { CommandPalette } from './CommandPalette';

// ============================================================
// UTILITY COMPONENTS
// ============================================================
export { ThemeProvider, useTheme } from './ThemeProvider';
