import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';

export const MainLayout = () => {
  const { sidebarOpen, sidebarCollapsed } = useUIStore();
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className={cn('flex-1 flex flex-col overflow-hidden', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};