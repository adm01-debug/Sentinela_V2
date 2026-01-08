import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HeroMetrics } from '@/components/dashboard/HeroMetrics';
import { OnboardingWizard, OnboardingBanner } from '@/components/onboarding/OnboardingWizard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Users,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Quick action card component
const QuickActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href,
  color,
  delay = 0 
}: { 
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  delay?: number;
}) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        onClick={() => navigate(href)}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-${color}/10 group-hover:bg-${color}/20 transition-colors`}>
              <Icon className={`h-5 w-5 text-${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(true);
  
  // Check onboarding status
  useEffect(() => {
    const skipped = localStorage.getItem('onboarding_skipped');
    const completed = localStorage.getItem('onboarding_completed_steps');
    
    if (completed) {
      setCompletedSteps(JSON.parse(completed));
    }
    
    // Show onboarding for new users
    if (!skipped && !completed) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [employees, violations, productivity] = await Promise.all([
        supabase.from('employees').select('id, status', { count: 'exact' }),
        supabase.from('security_violations').select('id', { count: 'exact' })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('productivity_logs').select('productive_time_seconds')
          .gte('recorded_date', new Date().toISOString().split('T')[0])
          .limit(100),
      ]);
      
      const activeCount = employees.data?.filter(e => e.status === 'active').length || 0;
      const totalProd = productivity.data?.reduce((acc, p) => acc + (p.productive_time_seconds || 0), 0) || 0;
      const avgProd = productivity.data?.length ? Math.round((totalProd / productivity.data.length / 28800) * 100) : 87;
      
      return {
        totalEmployees: employees.count || 0,
        activeNow: activeCount,
        violationsToday: violations.count || 0,
        productivity: Math.min(avgProd, 100),
      };
    },
    staleTime: 30000,
  });
  
  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('onboarding_banner_dismissed', 'true');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do monitoramento da sua equipe</p>
          </div>
          <Button onClick={() => navigate('/reports')} variant="outline" className="hidden sm:flex">
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Relatórios
          </Button>
        </motion.div>
        
        {/* Onboarding banner */}
        {showBanner && completedSteps.length < 5 && (
          <OnboardingBanner 
            onOpenWizard={() => setShowOnboarding(true)}
            completedSteps={completedSteps}
            onDismiss={handleDismissBanner}
          />
        )}
        
        {/* Hero Metrics */}
        <HeroMetrics
          totalEmployees={stats?.totalEmployees || 245}
          activeNow={stats?.activeNow || 128}
          violationsToday={stats?.violationsToday || 12}
          productivity={stats?.productivity || 87}
          employeeChange={5}
          activeChange={12}
          violationsChange={-23}
          productivityChange={3}
        />
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="Adicionar Funcionário"
              description="Cadastre um novo membro"
              icon={Users}
              href="/employees/create"
              color="primary"
              delay={0.5}
            />
            <QuickActionCard
              title="Ver Atividades"
              description="Monitore em tempo real"
              icon={Activity}
              href="/monitoring"
              color="success"
              delay={0.6}
            />
            <QuickActionCard
              title="Analisar Produtividade"
              description="Relatórios detalhados"
              icon={TrendingUp}
              href="/productivity-comparison"
              color="info"
              delay={0.7}
            />
            <QuickActionCard
              title="Histórico de Sessões"
              description="Veja gravações"
              icon={Clock}
              href="/timeline"
              color="warning"
              delay={0.8}
            />
          </div>
        </motion.div>
        
        {/* Activity Summary */}
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Atividade Recente</CardTitle>
                <CardDescription>Últimos eventos do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '2 min', event: 'João Silva iniciou sessão', type: 'login' },
                    { time: '15 min', event: 'Maria Santos - alta produtividade', type: 'productivity' },
                    { time: '32 min', event: 'Alerta de política em PC-045', type: 'alert' },
                    { time: '1h', event: 'Relatório semanal gerado', type: 'report' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-xs text-muted-foreground w-12">{item.time}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'alert' ? 'bg-destructive' : 
                        item.type === 'productivity' ? 'bg-success' : 'bg-primary'
                      }`} />
                      <span className="text-muted-foreground">{item.event}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/activities')}>
                  Ver todas as atividades
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dicas do Sistema</CardTitle>
                <CardDescription>Maximize o uso do Sentinela</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { tip: 'Use ⌘K para busca rápida', icon: '⌨️' },
                    { tip: 'Configure alertas para violações críticas', icon: '🔔' },
                    { tip: 'Agende relatórios automáticos semanais', icon: '📊' },
                    { tip: 'Crie geofences para trabalho remoto', icon: '📍' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-muted-foreground">{item.tip}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/help')}>
                  Ver documentação
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        completedSteps={completedSteps}
        onComplete={() => {
          localStorage.setItem('onboarding_completed', 'true');
        }}
      />
    </DashboardLayout>
  );
}
