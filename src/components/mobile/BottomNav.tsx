import { memo, useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Shield,
  Bell,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface BottomNavItem {
  titleKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const mainNavItems: BottomNavItem[] = [
  { titleKey: 'navigation.dashboard', href: '/', icon: LayoutDashboard },
  { titleKey: 'navigation.employees', href: '/employees', icon: Users },
  { titleKey: 'navigation.violations', href: '/violations', icon: Shield },
  { titleKey: 'navigation.notifications', href: '/notifications', icon: Bell },
];

const moreNavItems: BottomNavItem[] = [
  { titleKey: 'common.settings', href: '/settings', icon: Settings },
];

interface BottomNavItemProps {
  item: BottomNavItem;
  isActive: boolean;
}

const BottomNavItem = memo(function BottomNavItem({ item, isActive }: BottomNavItemProps) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const title = t(item.titleKey);

  return (
    <NavLink
      to={item.href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] min-h-[56px]',
        'transition-all duration-200 touch-target',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <div className="relative">
        <Icon className={cn('h-6 w-6 transition-transform', isActive && 'scale-110')} />
        {item.badge !== undefined && item.badge > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full"
          >
            {item.badge > 9 ? '9+' : item.badge}
          </Badge>
        )}
      </div>
      <span className={cn(
        'text-[11px] font-medium truncate max-w-[60px]',
        isActive && 'font-semibold'
      )}>
        {title}
      </span>
      {isActive && (
        <motion.div
          layoutId="bottomNavIndicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </NavLink>
  );
});

export interface BottomNavProps {
  className?: string;
  notificationCount?: number;
}

function BottomNavComponent({ className, notificationCount = 0 }: BottomNavProps) {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const toggleMore = useCallback(() => {
    setShowMore((prev) => !prev);
  }, []);

  const itemsWithBadges = mainNavItems.map((item) => ({
    ...item,
    badge: item.href === '/notifications' ? notificationCount : item.badge,
    isActive: location.pathname === item.href,
  }));

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={toggleMore}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-4 right-4 bg-card border rounded-xl shadow-xl z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Mais opções</span>
                <button
                  onClick={toggleMore}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={toggleMore}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 p-4 rounded-xl',
                        'transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-medium">{item.titleKey}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md',
          'border-t safe-area-bottom',
          'flex items-center justify-around',
          'lg:hidden', // Hide on desktop
          className
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {itemsWithBadges.map((item) => (
          <BottomNavItem key={item.href} item={item} isActive={item.isActive} />
        ))}
        <button
          onClick={toggleMore}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] min-h-[56px]',
            'transition-all duration-200 touch-target',
            showMore
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <MoreHorizontal className="h-6 w-6" />
          <span className="text-[11px] font-medium">Mais</span>
        </button>
      </nav>
    </>
  );
}

export const BottomNav = memo(BottomNavComponent);
