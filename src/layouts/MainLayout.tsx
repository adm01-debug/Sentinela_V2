import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export const MainLayout = () => {
  const { sidebarCollapsed } = useUIStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <MobileSidebar onNavigate={handleMobileMenuClose} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-300',
          'md:ml-16',
          !sidebarCollapsed && 'md:ml-64'
        )}
      >
        <Header onMenuClick={handleMobileMenuToggle} />
        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-auto p-4 sm:p-6 pb-20 md:pb-6"
        >
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
