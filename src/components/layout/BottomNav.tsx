import { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Monitor,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const primaryNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Funcionários', href: '/employees', icon: Users },
  { label: 'Monitoramento', href: '/monitoring', icon: Monitor },
  { label: 'Violações', href: '/violations', icon: AlertTriangle },
];

const NavItem = memo(function NavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-[64px]',
        isActive
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium truncate max-w-full">
        {item.label}
      </span>
    </NavLink>
  );
});

function BottomNavComponent() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1">
        {primaryNavItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={location.pathname === item.href}
          />
        ))}
        
        {/* More menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-3"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">Mais</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Menu</h3>
              <ScrollArea className="h-[calc(70vh-100px)]">
                <div className="grid grid-cols-3 gap-4 pb-safe">
                  {moreNavItems.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          'flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/50 hover:bg-muted'
                        )
                      }
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-xs font-medium text-center">
                        {item.label}
                      </span>
                    </NavLink>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

// More items for the drawer
import {
  Shield,
  Settings,
  FileText,
  Map,
  Calendar,
  Award,
  Globe,
  Key,
  BarChart3,
  Smartphone,
  Brain,
  UserCog,
} from 'lucide-react';

const moreNavItems: NavItem[] = [
  { label: 'Equipes', href: '/teams', icon: Users },
  { label: 'Dispositivos', href: '/devices', icon: Smartphone },
  { label: 'Políticas', href: '/violation-rules', icon: Shield },
  { label: 'Relatórios', href: '/reports', icon: FileText },
  { label: 'Geofencing', href: '/geofencing', icon: Map },
  { label: 'Horários', href: '/work-schedules', icon: Calendar },
  { label: 'Gamificação', href: '/gamification', icon: Award },
  { label: 'Internet', href: '/internet-access', icon: Globe },
  { label: 'Chaves', href: '/agent-keys', icon: Key },
  { label: 'Produtividade', href: '/productivity-comparison', icon: BarChart3 },
  { label: 'IA', href: '/ai-analysis', icon: Brain },
  { label: 'Usuários', href: '/user-management', icon: UserCog },
  { label: 'Configurações', href: '/settings', icon: Settings },
];

export const BottomNav = memo(BottomNavComponent);
