import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { SkipLinks } from '@/components/ui/SkipLinks';
import { HealthMonitor } from '@/components/HealthMonitor';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { CommandPalette } from '@/components/CommandPalette';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcutsProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const MainLayout = () => {
  useDocumentTitle();
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global "Back" keyboard shortcut
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isMobileMenuOpen && !isCommandPaletteOpen) {
        // Only navigate back if no modals are open
        const isDialogVisible = document.querySelector('[role="dialog"]');
        if (!isDialogVisible && location.pathname !== '/dashboard') {
          navigate(-1);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [location.pathname, navigate, isMobileMenuOpen, isCommandPaletteOpen]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleCommandPaletteOpen = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  return (
    <KeyboardShortcutsProvider>
      <SkipLinks />
      <HealthMonitor />
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <nav id="main-nav" aria-label="Navegação principal" className="hidden md:block">
          <AppSidebar />
        </nav>

        {/* Mobile Sidebar Removed (using AppSidebar or separate component if needed) */}
        <div className="hidden">
           {/* Placeholder if mobile specific sidebar is required */}
        </div>

        {/* Command Palette */}
        <CommandPalette open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen} />
        <KeyboardShortcutsDialog />

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
            className="flex-1 overflow-auto px-4 py-4 sm:px-5 sm:py-5 pb-20 md:pb-5 scroll-smooth"
          >
            <div className="max-w-[1600px] mx-auto w-full">
              <Breadcrumbs className="mb-4" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
          <ScrollToTopButton />
        </div>
      </div>
    </KeyboardShortcutsProvider>
  );
};
