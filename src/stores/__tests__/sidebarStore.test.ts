// Sidebar Store Tests for Sentinela v17
import { describe, it, expect, beforeEach } from 'vitest';
import { useSidebarStore } from '../sidebarStore';

describe('sidebarStore', () => {
  beforeEach(() => {
    useSidebarStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useSidebarStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.isCollapsed).toBe(false);
    expect(state.isPinned).toBe(true);
    expect(state.width).toBe(260);
    expect(state.isMobileOpen).toBe(false);
  });

  it('should toggle sidebar', () => {
    const { toggle } = useSidebarStore.getState();
    toggle();
    expect(useSidebarStore.getState().isOpen).toBe(false);
    toggle();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('should open and close sidebar', () => {
    const store = useSidebarStore.getState();
    store.close();
    expect(useSidebarStore.getState().isOpen).toBe(false);
    store.open();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('should toggle collapsed state', () => {
    const { toggleCollapsed } = useSidebarStore.getState();
    toggleCollapsed();
    expect(useSidebarStore.getState().isCollapsed).toBe(true);
  });

  it('should toggle pinned state', () => {
    const { togglePinned } = useSidebarStore.getState();
    togglePinned();
    expect(useSidebarStore.getState().isPinned).toBe(false);
  });

  it('should toggle expanded items', () => {
    const { toggleExpanded } = useSidebarStore.getState();
    toggleExpanded('menu-1');
    expect(useSidebarStore.getState().expandedItems).toContain('menu-1');
    toggleExpanded('menu-1');
    expect(useSidebarStore.getState().expandedItems).not.toContain('menu-1');
  });

  it('should set width within bounds', () => {
    const { setWidth } = useSidebarStore.getState();
    setWidth(300);
    expect(useSidebarStore.getState().width).toBe(300);
    setWidth(100); // Below minWidth
    expect(useSidebarStore.getState().width).toBe(200);
    setWidth(500); // Above maxWidth
    expect(useSidebarStore.getState().width).toBe(400);
  });

  it('should handle mobile toggle', () => {
    const store = useSidebarStore.getState();
    store.openMobile();
    expect(useSidebarStore.getState().isMobileOpen).toBe(true);
    store.closeMobile();
    expect(useSidebarStore.getState().isMobileOpen).toBe(false);
  });
});
