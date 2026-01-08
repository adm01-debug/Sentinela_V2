import { memo, ReactNode, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useSidebarStore } from '@/lib/stores';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

/**
 * ResponsiveLayout - Layout responsivo principal
 * 
 * - Desktop: Sidebar fixa à esquerda + Header + Content
 * - Mobile: Header com menu hamburger + Content + BottomNav
 */
function ResponsiveLayoutComponent({ children }: ResponsiveLayoutProps) {
  const { isCollapsed } = useSidebarStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Sheet - Uses MobileSidebar without fixed positioning */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <MobileSidebar onNavigate={handleMobileMenuClose} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div 
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          // Desktop: offset by sidebar width
          'md:pl-16',
          !isCollapsed && 'md:pl-64'
        )}
      >
        {/* Header */}
        <Header onMenuClick={handleMobileMenuToggle} />

        {/* Page Content */}
        <main 
          id="main-content" 
          className={cn(
            'flex-1',
            // Padding responsivo
            'px-4 py-4',
            'sm:px-6 sm:py-6',
            'lg:px-8',
            // Espaço para BottomNav no mobile
            'pb-20 md:pb-6'
          )}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

export const ResponsiveLayout = memo(ResponsiveLayoutComponent);
