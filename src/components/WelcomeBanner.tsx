import { memo } from 'react';
import { Shield, Sparkles, AlertTriangle, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboard';

export const WelcomeBanner = memo(function WelcomeBanner() {
  const { user } = useAuth();
  const { data: stats } = useDashboardStats();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  
  const rawName = user?.name || user?.email?.split('@')[0] || '';
  const looksLikeSlug = rawName.length > 0 && rawName.length <= 12 && !/\s/.test(rawName) && /^[a-z0-9_.-]+$/i.test(rawName);
  const displayName = looksLikeSlug && rawName.length < 4 ? 'Administrador' : rawName || 'Administrador';

  const alertsCount = stats?.alertsCount || 0;
  const activeEmployees = stats?.activeEmployees || 0;

  const contextMessage = alertsCount > 0
    ? `${alertsCount} alerta${alertsCount > 1 ? 's' : ''} pendente${alertsCount > 1 ? 's' : ''} · ${activeEmployees} funcionário${activeEmployees !== 1 ? 's' : ''} ativo${activeEmployees !== 1 ? 's' : ''} agora.`
    : activeEmployees > 0
      ? `Tudo tranquilo! ${activeEmployees} funcionário${activeEmployees !== 1 ? 's' : ''} ativo${activeEmployees !== 1 ? 's' : ''} agora.`
      : 'Tudo sob controle. Seu painel está atualizado em tempo real.';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-5"
    >
      {/* Decorative glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 shrink-0">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {greeting}, {displayName}
            <Sparkles className="h-4 w-4 text-warning" />
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            {alertsCount > 0 && <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />}
            {contextMessage}
          </p>
        </div>

        {/* Mini stats pills */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/60 border border-border/40 text-xs">
            <Users className="h-3.5 w-3.5 text-success" />
            <span className="font-semibold text-foreground">{activeEmployees}</span>
            <span className="text-muted-foreground">ativos</span>
          </div>
          {alertsCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <span className="font-semibold text-warning">{alertsCount}</span>
              <span className="text-warning/80">alertas</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
