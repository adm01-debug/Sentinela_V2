import { describe, it, expect, beforeEach } from 'vitest';
import { useScreenshotStore } from '../screenshotStore';

describe('screenshotStore', () => {
  beforeEach(() => { useScreenshotStore.getState().reset(); });

  it('should have correct initial state', () => {
    const state = useScreenshotStore.getState();
    expect(state.screenshots).toEqual([]);
    expect(state.selectedIds.size).toBe(0);
    expect(state.viewMode).toBe('grid');
  });

  it('should add screenshot', () => {
    const { addScreenshot } = useScreenshotStore.getState();
    addScreenshot({ id: '1', url: 'test.png', employeeId: 'e1' } as any);
    expect(useScreenshotStore.getState().screenshots).toHaveLength(1);
  });

  it('should toggle selection', () => {
    const store = useScreenshotStore.getState();
    store.toggleSelection('1');
    expect(useScreenshotStore.getState().selectedIds.has('1')).toBe(true);
    store.toggleSelection('1');
    expect(useScreenshotStore.getState().selectedIds.has('1')).toBe(false);
  });

  it('should change view mode', () => {
    const { setViewMode } = useScreenshotStore.getState();
    setViewMode('list');
    expect(useScreenshotStore.getState().viewMode).toBe('list');
  });
});
