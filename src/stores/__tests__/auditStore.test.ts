import { describe, it, expect, beforeEach } from 'vitest';
import { useAuditStore } from '../auditStore';

describe('auditStore', () => {
  beforeEach(() => { useAuditStore.getState().reset(); });

  it('should have correct initial state', () => {
    const state = useAuditStore.getState();
    expect(state.logs).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('should add log entry', () => {
    const { addLog } = useAuditStore.getState();
    addLog({ id: '1', action: 'CREATE', userId: 'u1' } as any);
    expect(useAuditStore.getState().logs).toHaveLength(1);
  });

  it('should set filters', () => {
    const { setFilters } = useAuditStore.getState();
    setFilters({ action: 'DELETE' });
    expect(useAuditStore.getState().filters.action).toBe('DELETE');
  });

  it('should clear filters', () => {
    const store = useAuditStore.getState();
    store.setFilters({ action: 'DELETE' });
    store.clearFilters();
    expect(useAuditStore.getState().filters).toEqual({});
  });
});
