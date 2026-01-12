import { describe, it, expect, beforeEach } from 'vitest';
import { useClipboardStore } from '../clipboardStore';

describe('clipboardStore', () => {
  beforeEach(() => { useClipboardStore.getState().reset(); });

  it('should have correct initial state', () => {
    const state = useClipboardStore.getState();
    expect(state.content).toBeNull();
    expect(state.history).toEqual([]);
  });

  it('should set content', () => {
    const { setContent } = useClipboardStore.getState();
    setContent({ type: 'text', data: 'test' });
    expect(useClipboardStore.getState().content?.data).toBe('test');
  });

  it('should add to history', () => {
    const store = useClipboardStore.getState();
    store.setContent({ type: 'text', data: 'a' });
    store.setContent({ type: 'text', data: 'b' });
    expect(useClipboardStore.getState().history.length).toBeGreaterThanOrEqual(1);
  });

  it('should clear content', () => {
    const store = useClipboardStore.getState();
    store.setContent({ type: 'text', data: 'test' });
    store.clear();
    expect(useClipboardStore.getState().content).toBeNull();
  });
});
