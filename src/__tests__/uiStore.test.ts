import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../stores/uiStore';

describe('uiStore', () => {
  beforeEach(() => { useUIStore.setState({ sidebarOpen: true, sidebarCollapsed: false, commandPaletteOpen: false }); });
  it('toggles sidebar', () => { useUIStore.getState().toggleSidebar(); expect(useUIStore.getState().sidebarOpen).toBe(false); });
  it('opens command palette', () => { useUIStore.getState().openCommandPalette(); expect(useUIStore.getState().commandPaletteOpen).toBe(true); });
});