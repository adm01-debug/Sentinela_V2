import { memo } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export const WelcomeBanner = memo(function WelcomeBanner() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const displayName = user?.name || user?.email?.split('@')[0] || 'Administrador';

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
          <p className="text-sm text-muted-foreground mt-0.5">
            Tudo sob controle. Seu painel está atualizado em tempo real.
          </p>
        </div>
      </div>
    </motion.div>
  );
});
