// UI Components
export * from './ui';

// Layout Components
export * from './Header';
export * from './AppSidebar';
export * from './Breadcrumbs';

// Data Display Components
export * from './TopEmployeesList';
export * from './RecentAlerts';
export * from './AlertList';
export * from './AlertFilters';
export * from './ActivityFilters';
export * from './ActivityTable';
export * from './ActivityTimeline';
export * from './ApplicationBreakdown';

// Employee Components
export * from './AddEmployeeDialog';
export * from './EmployeeHeader';
export * from './ScreenshotGallery';

// Report Components
export * from './ReportList';
export * from './GenerateReportDialog';

// Settings Components
export * from './LanguageSwitcher';

// Chart Components
export * from './ViolationsByTypeChart';

// Re-exports from subfolders for backward compatibility
export { DataTable } from './data-display/DataTable';
export { EmployeeFilters } from './employees/EmployeeFilters';
export { EmployeeStats } from './employees/EmployeeStats';
export { EmployeeStatsCards } from './employees/EmployeeStatsCards';
export { PageHeader } from './layout/PageHeader';
export { ConfirmDialog } from './ConfirmDialog';
export { LocationMap } from './LocationMap';
export { OnboardingWizard } from './onboarding/OnboardingWizard';
