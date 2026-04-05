import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { MainLayout } from '@/layouts/MainLayout';
import { BrandedSplash } from '@/components/ui/LoadingSpinner';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { supabase } from '@/integrations/supabase/client';

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
const TimeClockPage = lazy(() => import('@/pages/TimeClockPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const TimesheetsPage = lazy(() => import('@/pages/TimesheetsPage'));
const AttendancePage = lazy(() => import('@/pages/AttendancePage'));
const HoursTrackingPage = lazy(() => import('@/pages/HoursTrackingPage'));
const AdminTelemetriaPage = lazy(() => import('@/pages/AdminTelemetriaPage'));

// ============================================================
// SESSION HOOK (single source)
// ============================================================
function useSupabaseSession() {
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return session;
}

// ============================================================
// ROUTE GUARDS
// ============================================================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSupabaseSession();
  
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const session = useSupabaseSession();
  
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (session) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  
  return <>{children}</>;
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

// ============================================================
// APP ROUTES
// ============================================================
export const AppRoutes = () => (
  <RouteErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* Auth */}
      <Route path="/auth" element={<AuthGuard><Auth /></AuthGuard>} />
      <Route path={ROUTES.LOGIN} element={<Navigate to="/auth" replace />} />
      <Route path={ROUTES.REGISTER} element={<Navigate to="/auth" replace />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
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
        <Route path="/teams/:id" element={<TeamDetailPage />} />
        <Route path={ROUTES.ADMIN_DEPARTMENTS} element={<DepartmentsPage />} />
        <Route path="/departments/:id" element={<DepartmentDetailPage />} />
        <Route path={ROUTES.ADMIN_AUDIT} element={<AuditLogPage />} />

        <Route path="/devices" element={<DevicesPage />} />
        <Route path={ROUTES.SCREENSHOTS} element={<ScreenshotsPage />} />
        <Route path="/screenshots/:id" element={<ScreenshotDetailPage />} />

        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/integrations/webhooks" element={<WebhooksPage />} />
        <Route path="/integrations/whatsapp" element={<WhatsAppIntegrationPage />} />

        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/geofencing" element={<GeofencingPage />} />
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
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </RouteErrorBoundary>
);
