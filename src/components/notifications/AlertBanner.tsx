import React, { useState, useEffect, useCallback, memo } from 'react';
import { X, AlertTriangle, Info, AlertCircle, CheckCircle, ChevronRight, Timer, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export type AlertBannerType = 'info' | 'warning' | 'error' | 'success' | 'announcement';
export type AlertBannerPosition = 'top' | 'bottom';

export interface AlertBannerProps {
  id: string;
  type: AlertBannerType;
  title: string;
  message?: string;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
  expiresAt?: Date;
  showCountdown?: boolean;
  position?: AlertBannerPosition;
  className?: string;
  persist?: boolean;
}

const typeConfig: Record<AlertBannerType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}> = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-950/50',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-100',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive dark:text-red-100',
    iconColor: 'text-destructive',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 dark:bg-green-950/50',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-100',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  announcement: {
    icon: Megaphone,
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-primary-foreground dark:text-primary',
    iconColor: 'text-primary',
  },
};

function AlertBannerComponent({
  id,
  type,
  title,
  message,
  actionLabel,
  actionUrl,
  onAction,
  dismissible = true,
  onDismiss,
  expiresAt,
  showCountdown = false,
  position = 'top',
  className,
  persist = false,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const config = typeConfig[type];
  const Icon = config.icon;

  // Check localStorage for dismissed banners
  useEffect(() => {
    if (persist) {
      const dismissed = localStorage.getItem(`banner-dismissed-${id}`);
      if (dismissed) {
        setIsVisible(false);
      }
    }
  }, [id, persist]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || !showCountdown) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, showCountdown]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (persist) {
      localStorage.setItem(`banner-dismissed-${id}`, 'true');
    }
    onDismiss?.(id);
  }, [id, persist, onDismiss]);

  const handleAction = useCallback(() => {
    if (actionUrl) {
      window.open(actionUrl, '_blank');
    }
    onAction?.();
  }, [actionUrl, onAction]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center justify-between gap-4 px-4 py-3 border',
          config.bg,
          config.border,
          config.text,
          position === 'top' ? 'border-t-0' : 'border-b-0',
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Icon className={cn('h-5 w-5 shrink-0', config.iconColor)} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{title}</span>
              {showCountdown && timeRemaining && (
                <span className="flex items-center gap-1 text-xs opacity-75">
                  <Timer className="h-3 w-3" />
                  {timeRemaining}
                </span>
              )}
            </div>
            {message && (
              <p className="text-sm opacity-90 mt-0.5 line-clamp-1">{message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actionLabel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAction}
              className={cn('h-8 text-xs font-medium', config.text)}
            >
              {actionLabel}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
          
          {dismissible && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className={cn('h-8 w-8', config.text)}
              aria-label="Fechar banner"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const AlertBanner = memo(AlertBannerComponent);

// Alert Banner Stack for multiple banners
interface AlertBannerStackProps {
  banners: AlertBannerProps[];
  onDismiss?: (id: string) => void;
  position?: AlertBannerPosition;
  maxVisible?: number;
}

export function AlertBannerStack({
  banners,
  onDismiss,
  position = 'top',
  maxVisible = 3,
}: AlertBannerStackProps) {
  const visibleBanners = banners.slice(0, maxVisible);
  const hiddenCount = Math.max(0, banners.length - maxVisible);

  return (
    <div className={cn(
      'fixed left-0 right-0 z-50',
      position === 'top' ? 'top-0' : 'bottom-0'
    )}>
      <AnimatePresence>
        {visibleBanners.map((banner, index) => (
          <AlertBanner
            key={banner.id}
            {...banner}
            onDismiss={onDismiss}
            position={position}
          />
        ))}
      </AnimatePresence>
      
      {hiddenCount > 0 && (
        <div className={cn(
          'px-4 py-2 text-xs text-center text-muted-foreground bg-muted/50 border-x',
          position === 'top' ? 'border-b' : 'border-t'
        )}>
          + {hiddenCount} outras notificações
        </div>
      )}
    </div>
  );
}

// Maintenance Banner
interface MaintenanceBannerProps {
  scheduledAt: Date;
  estimatedDuration: string;
  onDismiss?: () => void;
}

export function MaintenanceBanner({ scheduledAt, estimatedDuration, onDismiss }: MaintenanceBannerProps) {
  return (
    <AlertBanner
      id="maintenance"
      type="warning"
      title="Manutenção Programada"
      message={`Manutenção agendada para ${scheduledAt.toLocaleDateString('pt-BR')} às ${scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Duração estimada: ${estimatedDuration}`}
      expiresAt={scheduledAt}
      showCountdown
      dismissible
      onDismiss={() => onDismiss?.()}
    />
  );
}

// Feature Announcement
interface FeatureAnnouncementProps {
  title: string;
  description: string;
  learnMoreUrl?: string;
  onDismiss?: () => void;
}

export function FeatureAnnouncement({ title, description, learnMoreUrl, onDismiss }: FeatureAnnouncementProps) {
  return (
    <AlertBanner
      id={`feature-${title.replace(/\s/g, '-').toLowerCase()}`}
      type="announcement"
      title={title}
      message={description}
      actionLabel="Saiba mais"
      actionUrl={learnMoreUrl}
      dismissible
      persist
      onDismiss={() => onDismiss?.()}
    />
  );
}

export default AlertBanner;
