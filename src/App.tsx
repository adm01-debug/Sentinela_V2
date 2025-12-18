import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PolicyGate } from "@/components/PolicyGate";
import Index from "./pages/Index";
import EmployeeDetail from "./pages/EmployeeDetail";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Violations from "./pages/Violations";
import Monitoring from "./pages/Monitoring";
import AgentKeys from "./pages/AgentKeys";
import ViolationRules from "./pages/ViolationRules";
import InternetAccess from "./pages/InternetAccess";
import SensitiveKeywords from "./pages/SensitiveKeywords";
import AIAnalysis from "./pages/AIAnalysis";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import MonitoringPolicies from "./pages/MonitoringPolicies";
import PolicyAcknowledgments from "./pages/PolicyAcknowledgments";
import Teams from "./pages/Teams";
import Employees from "./pages/Employees";
import WorkSchedules from "./pages/WorkSchedules";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            <Route path="/monitoring-policies" element={
              <ProtectedRoute>
                <PolicyGate>
                  <MonitoringPolicies />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <Index />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/teams" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <Teams />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <Employees />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/employee/:id" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <EmployeeDetail />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <Settings />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <Reports />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/violations" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <Violations />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/monitoring" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <Monitoring />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/agent-keys" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <AgentKeys />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/violation-rules" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <ViolationRules />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/internet-access" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <InternetAccess />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/sensitive-keywords" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <SensitiveKeywords />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/ai-analysis" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <AIAnalysis />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/policy-acknowledgments" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <PolicyAcknowledgments />
                </PolicyGate>
              </ProtectedRoute>
            } />
            <Route path="/work-schedules" element={
              <ProtectedRoute requireAdmin>
                <PolicyGate>
                  <WorkSchedules />
                </PolicyGate>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
