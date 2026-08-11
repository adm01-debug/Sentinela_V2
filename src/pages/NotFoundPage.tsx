import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Home, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="text-center space-y-6 max-w-md"
      >
        {/* Brand mark */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-2xl scale-150" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* 404 number */}
        <div className="relative">
          <span className="text-[120px] sm:text-[160px] font-black leading-none text-gradient select-none">
            404
          </span>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {t('errors.notFound')}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t('errors.notFoundDescription')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => window.history.back()} variant="outline" className="gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Link to={ROUTES.DASHBOARD} className="w-full sm:w-auto">
            <Button className="gap-2 w-full">
              <Home className="h-4 w-4" />
              {t('errors.goHome')}
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/50 pt-4">
          Sentinela · Monitoramento Inteligente
        </p>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
