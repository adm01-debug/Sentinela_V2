import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HeroMetrics } from '@/components/dashboard/HeroMetrics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const colorVariants = {
  primary: { bg: 'bg-primary/10', bgHover: 'group-hover:bg-primary/20', text: 'text-primary' },
  success: { bg: 'bg-green-500/10', bgHover: 'group-hover:bg-green-500/20', text: 'text-green-500' },
  info: { bg: 'bg-blue-500/10', bgHover: 'group-hover:bg-blue-500/20', text: 'text-blue-500' },
  warning: { bg: 'bg-yellow-500/10', bgHover: 'group-hover:bg-yellow-500/20', text: 'text-yellow-500' },
  destructive: { bg: 'bg-destructive/10', bgHover: 'group-hover:bg-destructive/20', text: 'text-destructive' },
};

const QuickActionCard = ({ 
  title, description, icon: Icon, href, color, delay = 0 
}: { 
  title: string; description: string; icon: React.ElementType; href: string; color: keyof typeof colorVariants; delay?: number;
}) => {
  const navigate = useNavigate();
  const colorClasses = colorVariants[color];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={() => navigate(href)}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-xl transition-colors', colorClasses.bg, colorClasses.bgHover)}>
              <Icon className={cn('h-5 w-5', colorClasses.text)} />
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
  
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [employees] = await Promise.all([
        supabase.from('employees').select('id, status', { count: 'exact' }),
      ]);
      const activeCount = employees.data?.filter(e => e.status === 'active').length || 0;
      return {
        totalEmployees: employees.count || 0,
        activeNow: activeCount,
        violationsToday: 0,
        productivity: 87,
      };
    },
    staleTime: 30000,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do monitoramento da sua equipe</p>
          </div>
          <Button onClick={() => navigate('/reports')} variant="outline" className="hidden sm:flex">
            <BarChart3 className="mr-2 h-4 w-4" />Ver Relatórios
          </Button>
        </motion.div>
        
        <HeroMetrics
          totalEmployees={stats?.totalEmployees || 0}
          activeNow={stats?.activeNow || 0}
          violationsToday={stats?.violationsToday || 0}
          productivity={stats?.productivity || 0}
          employeeChange={5}
          activeChange={12}
          violationsChange={-23}
          productivityChange={3}
        />
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard title="Adicionar Funcionário" description="Cadastre um novo membro" icon={Users} href="/employees/create" color="primary" delay={0.5} />
            <QuickActionCard title="Ver Atividades" description="Monitore em tempo real" icon={Activity} href="/monitoring" color="success" delay={0.6} />
            <QuickActionCard title="Analisar Produtividade" description="Relatórios detalhados" icon={TrendingUp} href="/productivity-comparison" color="info" delay={0.7} />
            <QuickActionCard title="Histórico de Sessões" description="Veja gravações" icon={Clock} href="/timeline" color="warning" delay={0.8} />
          </div>
        </motion.div>
        
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
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
                      <div className={`w-2 h-2 rounded-full ${item.type === 'alert' ? 'bg-destructive' : item.type === 'productivity' ? 'bg-green-500' : 'bg-primary'}`} />
                      <span className="text-muted-foreground">{item.event}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/activities')}>
                  Ver todas as atividades<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}>
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
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
