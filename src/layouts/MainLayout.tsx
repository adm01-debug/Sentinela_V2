import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { CommandPalette } from '@/components/CommandPalette';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const MainLayout = () => {
  useDocumentTitle();
  const { sidebarCollapsed } = useUIStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleCommandPaletteOpen = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <nav id="main-nav" aria-label="Navegação principal" className="hidden md:block">
        <AppSidebar />
      </nav>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <MobileSidebar onNavigate={handleMobileMenuClose} />
        </SheetContent>
      </Sheet>

      {/* Command Palette */}
      <CommandPalette open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen} />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-300',
          'md:ml-[60px]',
          !sidebarCollapsed && 'md:ml-[252px]'
        )}
      >
        <Header
          onMenuClick={handleMobileMenuToggle}
          onCommandPaletteOpen={handleCommandPaletteOpen}
        />
        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-auto px-4 py-4 sm:px-5 sm:py-5 pb-20 md:pb-5"
        >
          <Breadcrumbs className="mb-3" />
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
