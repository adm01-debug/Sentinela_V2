import { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Settings,
} from 'lucide-react';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'nav.employees', href: '/employees', icon: Users },
  { labelKey: 'sections.security', href: '/violations', icon: Shield },
  { labelKey: 'nav.reports', href: '/reports', icon: FileText },
  { labelKey: 'nav.settings', href: '/settings', icon: Settings },
];

function BottomNavComponent() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:scale-95'
              )}
            >
              {/* Active background pill */}
              {isActive && (
                <div className="absolute inset-x-2 inset-y-1 rounded-xl bg-primary/10 -z-10" />
              )}
              <Icon className={cn(
                'h-5 w-5 transition-transform duration-200',
                isActive && 'scale-110'
              )} />
              <span className={cn(
                'text-[10px] leading-tight',
                isActive ? 'font-semibold' : 'font-medium'
              )}>
                {t(item.labelKey)}
              </span>
              {/* Active dot indicator */}
              {isActive && (
                <div className="absolute -bottom-0.5 w-5 h-[3px] rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export const BottomNav = memo(BottomNavComponent);
export default BottomNav;
