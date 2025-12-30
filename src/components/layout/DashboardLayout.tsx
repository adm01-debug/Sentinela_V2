import { memo, ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayoutComponent({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main id="main-content" className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export const DashboardLayout = memo(DashboardLayoutComponent);