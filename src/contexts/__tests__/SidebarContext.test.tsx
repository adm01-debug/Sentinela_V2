import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// Mock SidebarContext
interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  collapse: () => void;
  expand: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | null>(null);

const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const value = {
    isOpen,
    isCollapsed,
    toggle: () => setIsOpen(prev => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    collapse: () => setIsCollapsed(true),
    expand: () => setIsCollapsed(false),
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

describe('SidebarContext', () => {
  describe('Provider', () => {
    it('should provide sidebar context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SidebarProvider>{children}</SidebarProvider>
      );

      const { result } = renderHook(() => useSidebar(), { wrapper });
      expect(result.current.isOpen).toBe(true);
      expect(result.current.isCollapsed).toBe(false);
    });

    it('should throw error without provider', () => {
      expect(() => {
        renderHook(() => useSidebar());
      }).toThrow('useSidebar must be used within SidebarProvider');
    });
  });

  describe('toggle functionality', () => {
    it('should toggle sidebar open state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SidebarProvider>{children}</SidebarProvider>
      );

      const { result } = renderHook(() => useSidebar(), { wrapper });
      
      expect(result.current.isOpen).toBe(true);
      act(() => result.current.toggle());
      expect(result.current.isOpen).toBe(false);
      act(() => result.current.toggle());
      expect(result.current.isOpen).toBe(true);
    });

    it('should open sidebar', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SidebarProvider>{children}</SidebarProvider>
      );

      const { result } = renderHook(() => useSidebar(), { wrapper });
      
      act(() => result.current.close());
      expect(result.current.isOpen).toBe(false);
      act(() => result.current.open());
      expect(result.current.isOpen).toBe(true);
    });

    it('should close sidebar', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SidebarProvider>{children}</SidebarProvider>
      );

      const { result } = renderHook(() => useSidebar(), { wrapper });
      
      act(() => result.current.close());
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('collapse functionality', () => {
    it('should collapse sidebar', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SidebarProvider>{children}</SidebarProvider>
      );

      const { result } = renderHook(() => useSidebar(), { wrapper });
      
      expect(result.current.isCollapsed).toBe(false);
      act(() => result.current.collapse());
      expect(result.current.isCollapsed).toBe(true);
    });

    it('should expand sidebar', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SidebarProvider>{children}</SidebarProvider>
      );

      const { result } = renderHook(() => useSidebar(), { wrapper });
      
      act(() => result.current.collapse());
      expect(result.current.isCollapsed).toBe(true);
      act(() => result.current.expand());
      expect(result.current.isCollapsed).toBe(false);
    });
  });

  describe('state persistence', () => {
    it('should maintain state across renders', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SidebarProvider>{children}</SidebarProvider>
      );

      const { result, rerender } = renderHook(() => useSidebar(), { wrapper });
      
      act(() => result.current.collapse());
      rerender();
      expect(result.current.isCollapsed).toBe(true);
    });
  });
});
