import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import EmployeeDetail from "./pages/EmployeeDetail";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Violations from "./pages/Violations";
import Monitoring from "./pages/Monitoring";
import AgentKeys from "./pages/AgentKeys";
import ViolationRules from "./pages/ViolationRules";
import InternetAccess from "./pages/InternetAccess";
import AIAnalysis from "./pages/AIAnalysis";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import MonitoringPolicies from "./pages/MonitoringPolicies";
import PolicyAcknowledgments from "./pages/PolicyAcknowledgments";
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
            <Route path="/monitoring-policies" element={<MonitoringPolicies />} />
            <Route path="/" element={
              <ProtectedRoute requireAdmin>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/employee/:id" element={
              <ProtectedRoute requireAdmin>
                <EmployeeDetail />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requireAdmin>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requireAdmin>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/violations" element={
              <ProtectedRoute requireAdmin>
                <Violations />
              </ProtectedRoute>
            } />
            <Route path="/monitoring" element={
              <ProtectedRoute requireAdmin>
                <Monitoring />
              </ProtectedRoute>
            } />
            <Route path="/agent-keys" element={
              <ProtectedRoute requireAdmin>
                <AgentKeys />
              </ProtectedRoute>
            } />
            <Route path="/violation-rules" element={
              <ProtectedRoute requireAdmin>
                <ViolationRules />
              </ProtectedRoute>
            } />
            <Route path="/internet-access" element={
              <ProtectedRoute requireAdmin>
                <InternetAccess />
              </ProtectedRoute>
            } />
            <Route path="/ai-analysis" element={
              <ProtectedRoute requireAdmin>
                <AIAnalysis />
              </ProtectedRoute>
            } />
            <Route path="/policy-acknowledgments" element={
              <ProtectedRoute requireAdmin>
                <PolicyAcknowledgments />
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
