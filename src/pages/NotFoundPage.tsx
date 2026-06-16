import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Shield, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-md space-y-6 text-center"
      >
        {/* Brand mark */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-2xl bg-primary/15 blur-2xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* 404 number */}
        <div className="relative">
          <span className="text-gradient select-none text-[120px] font-black leading-none sm:text-[160px]">
            404
          </span>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{t("errors.notFound")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("errors.notFoundDescription")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full gap-2 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Link to={ROUTES.DASHBOARD} className="w-full sm:w-auto">
            <Button className="w-full gap-2">
              <Home className="h-4 w-4" />
              {t("errors.goHome")}
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="pt-4 text-xs text-muted-foreground/50">
          Sentinela · Monitoramento Inteligente
        </p>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
