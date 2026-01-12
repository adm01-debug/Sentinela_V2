import { createContext, useContext, ReactNode } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';

const SidebarContext = createContext<ReturnType<typeof useSidebarStore> | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const store = useSidebarStore();
  return <SidebarContext.Provider value={store}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}
