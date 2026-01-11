import { NavLink } from 'react-router-dom';
import { Home, Users, Activity, FileText, Bell, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/stores';
import { cn } from '@/utils/cn';
import { ROUTES, APP_NAME } from '@/constants';

const navItems = [
  { icon: Home, label: 'Dashboard', path: ROUTES.DASHBOARD },
  { icon: Users, label: 'Employees', path: ROUTES.EMPLOYEES },
  { icon: Activity, label: 'Activities', path: ROUTES.ACTIVITIES },
  { icon: FileText, label: 'Reports', path: ROUTES.REPORTS },
  { icon: Bell, label: 'Alerts', path: ROUTES.ALERTS },
  { icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
];

export const AppSidebar = () => {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  return (
    <aside className={cn('fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-40', sidebarCollapsed ? 'w-16' : 'w-64')}>
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {!sidebarCollapsed && <span className="font-bold text-lg">{APP_NAME}</span>}
        <button onClick={toggleSidebarCollapse}>{sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}</button>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-md transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};