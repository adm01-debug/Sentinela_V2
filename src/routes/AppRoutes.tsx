import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { MainLayout } from '@/layouts/MainLayout';
import { BrandedSplash } from '@/components/ui/LoadingSpinner';
import { RouteErrorBoundary } from '@/components/layout/RouteErrorBoundary';
import { useAuth } from '@/hooks/useAuth';

// ============================================================
// LAZY LOADED PAGES
// ============================================================

const Auth = lazy(() => import('@/pages/Auth'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const EmployeesPage = lazy(() => import('@/pages/EmployeesPage'));
const EmployeeDetailPage = lazy(() => import('@/pages/EmployeeDetailPage'));
const EmployeeCreatePage = lazy(() => import('@/pages/EmployeeCreatePage'));
const ActivitiesPage = lazy(() => import('@/pages/ActivitiesPage'));
const ActivityDetailPage = lazy(() => import('@/pages/ActivityDetailPage'));
const ActivityTimelinePage = lazy(() => import('@/pages/ActivityTimelinePage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const AnalyticsProductivityPage = lazy(() => import('@/pages/AnalyticsProductivityPage'));
const AnalyticsApplicationsPage = lazy(() => import('@/pages/AnalyticsApplicationsPage'));
const AnalyticsTrendsPage = lazy(() => import('@/pages/AnalyticsTrendsPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const ReportDetailPage = lazy(() => import('@/pages/ReportDetailPage'));
const CustomReportsPage = lazy(() => import('@/pages/CustomReportsPage'));
const ScheduledReportsPage = lazy(() => import('@/pages/ScheduledReportsPage'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));
const AlertDetailPage = lazy(() => import('@/pages/AlertDetailPage'));
const AlertRulesPage = lazy(() => import('@/pages/AlertRulesPage'));
const MonitoringPage = lazy(() => import('@/pages/MonitoringPage'));
const ViolationsPage = lazy(() => import('@/pages/ViolationsPage'));
const ViolationDetailPage = lazy(() => import('@/pages/ViolationDetailPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfileSettingsPage = lazy(() => import('@/pages/ProfileSettingsPage'));
const SecuritySettingsPage = lazy(() => import('@/pages/SecuritySettingsPage'));
const NotificationSettingsPage = lazy(() => import('@/pages/NotificationSettingsPage'));
const IntegrationSettingsPage = lazy(() => import('@/pages/IntegrationSettingsPage'));
const BillingSettingsPage = lazy(() => import('@/pages/BillingSettingsPage'));
const ApiKeysPage = lazy(() => import('@/pages/ApiKeysPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const RolesPage = lazy(() => import('@/pages/RolesPage'));
const TeamsPage = lazy(() => import('@/pages/TeamsPage'));
const TeamDetailPage = lazy(() => import('@/pages/TeamDetailPage'));
const DepartmentsPage = lazy(() => import('@/pages/DepartmentsPage'));
const DepartmentDetailPage = lazy(() => import('@/pages/DepartmentDetailPage'));
const AuditLogPage = lazy(() => import('@/pages/AuditLogPage'));
const DevicesPage = lazy(() => import('@/pages/DevicesPage'));
const ScreenshotsPage = lazy(() => import('@/pages/ScreenshotsPage'));
const ScreenshotDetailPage = lazy(() => import('@/pages/ScreenshotDetailPage'));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage'));
const WebhooksPage = lazy(() => import('@/pages/WebhooksPage'));
const WhatsAppIntegrationPage = lazy(() => import('@/pages/WhatsAppIntegrationPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const GeofencingPage = lazy(() => import('@/pages/GeofencingPage'));
const WorkSchedulesPage = lazy(() => import('@/pages/WorkSchedulesPage'));
const DataExportPage = lazy(() => import('@/pages/DataExportPage'));
const CompliancePage = lazy(() => import('@/pages/CompliancePage'));
const AIAnalysisPage = lazy(() => import('@/pages/AIAnalysisPage'));
const GamificationPage = lazy(() => import('@/pages/GamificationPage'));
const InternetAccessPage = lazy(() => import('@/pages/InternetAccessPage'));
const GeofenceViolationsPage = lazy(() => import('@/pages/GeofenceViolationsPage'));
const TimeClockPage = lazy(() => import('@/pages/TimeClockPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const TimesheetsPage = lazy(() => import('@/pages/TimesheetsPage'));
const AttendancePage = lazy(() => import('@/pages/AttendancePage'));
const HoursTrackingPage = lazy(() => import('@/pages/HoursTrackingPage'));
const AdminTelemetriaPage = lazy(() => import('@/pages/AdminTelemetriaPage'));
const DLPPoliciesPage = lazy(() => import('@/pages/admin/DLPPoliciesPage'));
const DLPIncidentsPage = lazy(() => import('@/pages/admin/DLPIncidentsPage'));
const UEBADashboardPage = lazy(() => import('@/pages/admin/ueba/UEBADashboardPage'));
const EmployeeRiskProfilePage = lazy(() => import('@/pages/admin/ueba/EmployeeRiskProfilePage'));
const UEBASettingsPage = lazy(() => import('@/pages/admin/ueba/UEBASettingsPage'));
const EdgeFunctionDashboard = lazy(() => import('@/pages/admin/EdgeFunctionDashboard'));
const ChartSimulationPage = lazy(() => import('@/pages/dev/ChartSimulationPage'));
const VerifyReportSimulatorPage = lazy(() => import('@/pages/dev/VerifyReportSimulatorPage'));

const OrgChartPage = lazy(() => import('@/pages/OrgChartPage'));
const AgentOnboardingPage = lazy(() => import('@/pages/AgentOnboardingPage'));
const ApiDocsPage = lazy(() => import('@/pages/ApiDocsPage'));
const VerifyReportPage = lazy(() => import('@/pages/VerifyReportPage'));
const LiveViewPage = lazy(() => import('@/pages/LiveViewPage'));
const LiveViewSimulatorPage = lazy(() => import('@/pages/dev/LiveViewSimulatorPage'));
const IceDiagnosticsPage = lazy(() => import('@/pages/admin/IceDiagnosticsPage'));
const LiveViewReportPage = lazy(() => import('@/pages/admin/LiveViewReportPage'));
const AcknowledgmentReportPage = lazy(() => import('@/pages/admin/AcknowledgmentReportPage'));
const DisputeMetricsPage = lazy(() => import('@/pages/admin/DisputeMetricsPage'));
const DisputeEscalationAuditPage = lazy(() => import('@/pages/admin/DisputeEscalationAuditPage'));
const IntegrationsHealthPage = lazy(() => import('@/pages/admin/IntegrationsHealthPage'));


// ============================================================
// ROUTE GUARDS
// ============================================================
import { AuthGuard, GuestGuard, AdminGuard, SupervisorGuard } from '@/guards';

const PageLoader = () => <BrandedSplash />;

// ============================================================
// APP ROUTES
// ============================================================
export const AppRoutes = () => (
  <RouteErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* Dev-only public route for chart contrast simulation */}
      <Route path="/dev/chart-simulation" element={<ChartSimulationPage />} />
      <Route path="/dev/verify-simulator" element={<VerifyReportSimulatorPage />} />
      <Route path="/dev/live-view-simulator" element={<LiveViewSimulatorPage />} />


      {/* Auth */}
      <Route path="/auth" element={<GuestGuard><Auth /></GuestGuard>} />
      <Route path={ROUTES.LOGIN} element={<Navigate to="/auth" replace />} />
      <Route path={ROUTES.REGISTER} element={<Navigate to="/auth" replace />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />

      {/* Protected */}
      <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

        <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
        <Route path={ROUTES.EMPLOYEE_DETAIL} element={<EmployeeDetailPage />} />
        <Route path={ROUTES.EMPLOYEE_CREATE} element={<EmployeeCreatePage />} />

        <Route path={ROUTES.ACTIVITIES} element={<ActivitiesPage />} />
        <Route path="/activities/:id" element={<ActivityDetailPage />} />
        <Route path="/activities/timeline" element={<ActivityTimelinePage />} />

        <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
        <Route path={ROUTES.ANALYTICS_PRODUCTIVITY} element={<AnalyticsProductivityPage />} />
        <Route path={ROUTES.ANALYTICS_APPLICATIONS} element={<AnalyticsApplicationsPage />} />
        <Route path={ROUTES.ANALYTICS_TRENDS} element={<AnalyticsTrendsPage />} />

        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="/reports/custom" element={<CustomReportsPage />} />
        <Route path="/reports/scheduled" element={<ScheduledReportsPage />} />

        <Route path={ROUTES.ALERTS} element={<AlertsPage />} />
        <Route path="/alerts/:id" element={<AlertDetailPage />} />
        <Route path="/alerts/rules" element={<AlertRulesPage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
        <Route path="/violations" element={<ViolationsPage />} />
        <Route path="/violations/:id" element={<ViolationDetailPage />} />

        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.SETTINGS_PROFILE} element={<ProfileSettingsPage />} />
        <Route path={ROUTES.SETTINGS_SECURITY} element={<SecuritySettingsPage />} />
        <Route path={ROUTES.SETTINGS_NOTIFICATIONS} element={<NotificationSettingsPage />} />
        <Route path={ROUTES.SETTINGS_INTEGRATIONS} element={<IntegrationSettingsPage />} />
        <Route path={ROUTES.SETTINGS_BILLING} element={<BillingSettingsPage />} />
        <Route path={ROUTES.SETTINGS_API} element={<ApiKeysPage />} />

        <Route path={ROUTES.ADMIN_USERS} element={<UsersPage />} />
        <Route path={ROUTES.ADMIN_ROLES} element={<RolesPage />} />
        <Route path={ROUTES.ADMIN_TEAMS} element={<TeamsPage />} />
        <Route path={ROUTES.TEAM_DETAIL} element={<TeamDetailPage />} />
        <Route path={ROUTES.ADMIN_DEPARTMENTS} element={<DepartmentsPage />} />
        <Route path={ROUTES.DEPARTMENT_DETAIL} element={<DepartmentDetailPage />} />
        <Route path={ROUTES.ADMIN_AUDIT} element={<AuditLogPage />} />

        <Route path="/devices" element={<DevicesPage />} />
        <Route path={ROUTES.SCREENSHOTS} element={<ScreenshotsPage />} />
        <Route path="/screenshots/:id" element={<ScreenshotDetailPage />} />

        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/integrations/webhooks" element={<WebhooksPage />} />
        <Route path="/integrations/whatsapp" element={<WhatsAppIntegrationPage />} />

        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/geofencing" element={<SupervisorGuard><GeofencingPage /></SupervisorGuard>} />
        <Route path="/geofencing/alerts" element={<SupervisorGuard><GeofenceViolationsPage /></SupervisorGuard>} />
        <Route path="/work-schedules" element={<WorkSchedulesPage />} />
        <Route path="/export" element={<DataExportPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/ai-analysis" element={<AIAnalysisPage />} />
        <Route path="/gamification" element={<GamificationPage />} />
        <Route path="/internet-access" element={<InternetAccessPage />} />

        <Route path="/time-clock" element={<TimeClockPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/timesheets" element={<TimesheetsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/hours-tracking" element={<HoursTrackingPage />} />
        <Route path="/admin/telemetria" element={<AdminTelemetriaPage />} />
        <Route path="/admin/dlp/policies" element={<DLPPoliciesPage />} />
        <Route path="/admin/dlp/incidents" element={<DLPIncidentsPage />} />
        <Route path="/admin/ueba" element={<UEBADashboardPage />} />
        <Route path="/admin/ueba/settings" element={<UEBASettingsPage />} />
        <Route path="/admin/ueba/:employeeId" element={<EmployeeRiskProfilePage />} />
        <Route path="/admin/edge-functions" element={<EdgeFunctionDashboard />} />
        <Route path="/organization/chart" element={<OrgChartPage />} />
        <Route path="/docs/api" element={<ApiDocsPage />} />
        <Route path="/verify-report" element={<VerifyReportPage />} />
        <Route path="/agents/onboarding" element={<AdminGuard><AgentOnboardingPage /></AdminGuard>} />
        <Route path="/agents/:agentId/live" element={<AdminGuard><LiveViewPage /></AdminGuard>} />
        <Route path="/admin/ice-diagnostics" element={<AdminGuard><IceDiagnosticsPage /></AdminGuard>} />
        <Route path="/admin/live-view-report" element={<AdminGuard><LiveViewReportPage /></AdminGuard>} />
        <Route path="/admin/acknowledgment-report" element={<AdminGuard><AcknowledgmentReportPage /></AdminGuard>} />
        <Route path="/admin/dispute-metrics" element={<AdminGuard><DisputeMetricsPage /></AdminGuard>} />
        <Route path="/admin/dispute-escalation-audit" element={<AdminGuard><DisputeEscalationAuditPage /></AdminGuard>} />

      </Route>

      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </RouteErrorBoundary>
);
