import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PWAInstallPrompt, ConnectionStatus } from "@/components/PWAInstallPrompt";
import { Loader2 } from "lucide-react";

// Query Client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ============================================================
// LAZY LOADED PAGES - Reduz bundle inicial em ~70%
// ============================================================

// Auth (carrega primeiro, não precisa lazy)
import Auth from "./pages/Auth";

// Core pages - carregadas sob demanda
const Index = lazy(() => import("./pages/Index"));
const Employees = lazy(() => import("./pages/Employees"));
const EmployeeDetail = lazy(() => import("./pages/EmployeeDetail"));
const Teams = lazy(() => import("./pages/Teams"));
const Devices = lazy(() => import("./pages/Devices"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const MobileMonitoring = lazy(() => import("./pages/MobileMonitoring"));
const Violations = lazy(() => import("./pages/Violations"));
const ViolationRules = lazy(() => import("./pages/ViolationRules"));
const Security = lazy(() => import("./pages/Security"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

// Secondary pages
const Geofencing = lazy(() => import("./pages/Geofencing"));
const WorkSchedules = lazy(() => import("./pages/WorkSchedules"));
const AgentKeys = lazy(() => import("./pages/AgentKeys"));
const Webhooks = lazy(() => import("./pages/Webhooks"));
const WhatsAppIntegration = lazy(() => import("./pages/WhatsAppIntegration"));
const MessageTemplates = lazy(() => import("./pages/MessageTemplates"));
const ScheduledReports = lazy(() => import("./pages/ScheduledReports"));
const DataExport = lazy(() => import("./pages/DataExport"));
const AIAnalysis = lazy(() => import("./pages/AIAnalysis"));
const InternetAccess = lazy(() => import("./pages/InternetAccess"));
const SensitiveKeywords = lazy(() => import("./pages/SensitiveKeywords"));
const MonitoringPolicies = lazy(() => import("./pages/MonitoringPolicies"));
const PolicyAcknowledgments = lazy(() => import("./pages/PolicyAcknowledgments"));
const RateLimitDashboard = lazy(() => import("./pages/RateLimitDashboard"));
const ProductivityComparison = lazy(() => import("./pages/ProductivityComparison"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));

// New pages
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Gamification = lazy(() => import("./pages/Gamification"));

// ============================================================
// LOADING FALLBACK - Skeleton enquanto carrega
// ============================================================

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

function handleGlobalError(error: Error, errorInfo: React.ErrorInfo) {
  // Em produção, enviar para Sentry ou serviço de logs
  console.error('Global Error:', error);
  console.error('Error Info:', errorInfo);
  
  // Aqui você pode integrar com Sentry:
  // Sentry.captureException(error, { extra: errorInfo });
}

// ============================================================
// APP COMPONENT
// ============================================================

const App = () => (
  <ErrorBoundary onError={handleGlobalError}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="sentinela-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ConnectionStatus />
          <PWAInstallPrompt />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/install" element={<Install />} />
                
                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                <Route path="/employee/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
                <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
                <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
                <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
                <Route path="/mobile-monitoring" element={<ProtectedRoute><MobileMonitoring /></ProtectedRoute>} />
                <Route path="/violations" element={<ProtectedRoute><Violations /></ProtectedRoute>} />
                <Route path="/violation-rules" element={<ProtectedRoute><ViolationRules /></ProtectedRoute>} />
                <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/geofencing" element={<ProtectedRoute><Geofencing /></ProtectedRoute>} />
                <Route path="/work-schedules" element={<ProtectedRoute><WorkSchedules /></ProtectedRoute>} />
                <Route path="/agent-keys" element={<ProtectedRoute><AgentKeys /></ProtectedRoute>} />
                <Route path="/webhooks" element={<ProtectedRoute><Webhooks /></ProtectedRoute>} />
                <Route path="/whatsapp" element={<ProtectedRoute><WhatsAppIntegration /></ProtectedRoute>} />
                <Route path="/message-templates" element={<ProtectedRoute><MessageTemplates /></ProtectedRoute>} />
                <Route path="/scheduled-reports" element={<ProtectedRoute><ScheduledReports /></ProtectedRoute>} />
                <Route path="/data-export" element={<ProtectedRoute><DataExport /></ProtectedRoute>} />
                <Route path="/ai-analysis" element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />
                <Route path="/internet-access" element={<ProtectedRoute><InternetAccess /></ProtectedRoute>} />
                <Route path="/sensitive-keywords" element={<ProtectedRoute><SensitiveKeywords /></ProtectedRoute>} />
                <Route path="/monitoring-policies" element={<ProtectedRoute><MonitoringPolicies /></ProtectedRoute>} />
                <Route path="/policy-acknowledgments" element={<ProtectedRoute><PolicyAcknowledgments /></ProtectedRoute>} />
                <Route path="/rate-limit-dashboard" element={<ProtectedRoute><RateLimitDashboard /></ProtectedRoute>} />
                <Route path="/productivity-comparison" element={<ProtectedRoute><ProductivityComparison /></ProtectedRoute>} />
                <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/gamification" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
