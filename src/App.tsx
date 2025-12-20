import { Suspense, lazy, useCallback } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Outlet, Link, LinkProps } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { queryClient } from '@/lib/queryClient';
import { PageErrorBoundary } from '@/components/ErrorBoundary';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ============================================================
// ROUTE PREFETCH MAP
// ============================================================

const routeModules: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/Index'),
  '/employees': () => import('@/pages/Employees'),
  '/teams': () => import('@/pages/Teams'),
  '/devices': () => import('@/pages/Devices'),
  '/monitoring': () => import('@/pages/Monitoring'),
  '/violations': () => import('@/pages/Violations'),
  '/reports': () => import('@/pages/Reports'),
  '/settings': () => import('@/pages/Settings'),
};

// Prefetch function for route modules
export const prefetchRoute = (path: string) => {
  const loader = routeModules[path];
  if (loader) {
    loader();
  }
};

// ============================================================
// LAZY LOADED PAGES
// ============================================================

const Index = lazy(() => import('@/pages/Index'));
const Employees = lazy(() => import('@/pages/Employees'));
const EmployeeDetail = lazy(() => import('@/pages/EmployeeDetail'));
const Teams = lazy(() => import('@/pages/Teams'));
const Devices = lazy(() => import('@/pages/Devices'));
const Gamification = lazy(() => import('@/pages/Gamification'));
const Monitoring = lazy(() => import('@/pages/Monitoring'));
const MobileMonitoring = lazy(() => import('@/pages/MobileMonitoring'));
const Violations = lazy(() => import('@/pages/Violations'));
const ViolationRules = lazy(() => import('@/pages/ViolationRules'));
const Security = lazy(() => import('@/pages/Security'));
const Geofencing = lazy(() => import('@/pages/Geofencing'));
const WorkSchedules = lazy(() => import('@/pages/WorkSchedules'));
const AgentKeys = lazy(() => import('@/pages/AgentKeys'));
const Webhooks = lazy(() => import('@/pages/Webhooks'));
const WhatsAppIntegration = lazy(() => import('@/pages/WhatsAppIntegration'));
const MessageTemplates = lazy(() => import('@/pages/MessageTemplates'));
const Reports = lazy(() => import('@/pages/Reports'));
const ScheduledReports = lazy(() => import('@/pages/ScheduledReports'));
const DataExport = lazy(() => import('@/pages/DataExport'));
const AIAnalysis = lazy(() => import('@/pages/AIAnalysis'));
const ProductivityComparison = lazy(() => import('@/pages/ProductivityComparison'));
const InternetAccess = lazy(() => import('@/pages/InternetAccess'));
const SensitiveKeywords = lazy(() => import('@/pages/SensitiveKeywords'));
const MonitoringPolicies = lazy(() => import('@/pages/MonitoringPolicies'));
const PolicyAcknowledgments = lazy(() => import('@/pages/PolicyAcknowledgments'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const RateLimitDashboard = lazy(() => import('@/pages/RateLimitDashboard'));
const Settings = lazy(() => import('@/pages/Settings'));
const Auth = lazy(() => import('@/pages/Auth'));
const Install = lazy(() => import('@/pages/Install'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// ============================================================
// PROTECTED LAYOUT WRAPPER
// ============================================================

function AdminLayout() {
  return (
    <ProtectedRoute requireAdmin>
      <Outlet />
    </ProtectedRoute>
  );
}

// ============================================================
// APP COMPONENT
// ============================================================

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="sentinela-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <PageErrorBoundary>
                <Suspense fallback={<DashboardSkeleton />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/install" element={<Install />} />
                    
                    {/* Protected admin routes */}
                    <Route element={<AdminLayout />}>
                      {/* Dashboard */}
                      <Route path="/" element={<Index />} />
                      
                      {/* Employees */}
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/employees/:id" element={<EmployeeDetail />} />
                      <Route path="/teams" element={<Teams />} />
                      
                      {/* Devices & Gamification */}
                      <Route path="/devices" element={<Devices />} />
                      <Route path="/gamification" element={<Gamification />} />
                      
                      {/* Monitoring */}
                      <Route path="/monitoring" element={<Monitoring />} />
                      <Route path="/mobile-monitoring" element={<MobileMonitoring />} />
                      <Route path="/violations" element={<Violations />} />
                      <Route path="/violation-rules" element={<ViolationRules />} />
                      <Route path="/security" element={<Security />} />
                      
                      {/* Configuration */}
                      <Route path="/geofencing" element={<Geofencing />} />
                      <Route path="/work-schedules" element={<WorkSchedules />} />
                      <Route path="/agent-keys" element={<AgentKeys />} />
                      <Route path="/webhooks" element={<Webhooks />} />
                      <Route path="/whatsapp" element={<WhatsAppIntegration />} />
                      <Route path="/message-templates" element={<MessageTemplates />} />
                      
                      {/* Reports */}
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/scheduled-reports" element={<ScheduledReports />} />
                      <Route path="/data-export" element={<DataExport />} />
                      <Route path="/ai-analysis" element={<AIAnalysis />} />
                      <Route path="/productivity-comparison" element={<ProductivityComparison />} />
                      
                      {/* Policies */}
                      <Route path="/internet-access" element={<InternetAccess />} />
                      <Route path="/sensitive-keywords" element={<SensitiveKeywords />} />
                      <Route path="/monitoring-policies" element={<MonitoringPolicies />} />
                      <Route path="/policy-acknowledgments" element={<PolicyAcknowledgments />} />
                      
                      {/* System */}
                      <Route path="/user-management" element={<UserManagement />} />
                      <Route path="/rate-limit-dashboard" element={<RateLimitDashboard />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PageErrorBoundary>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

export default App;
