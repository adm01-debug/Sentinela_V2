import { memo, ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useSidebarStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayoutComponent({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarStore();
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={cn(
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <Header />
        <main id="main-content" className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export const DashboardLayout = memo(DashboardLayoutComponent);
