// Integration Store Tests for Sentinela v17
import { describe, it, expect, beforeEach } from 'vitest';
import { useIntegrationStore } from '../integrationStore';

describe('integrationStore', () => {
  beforeEach(() => {
    useIntegrationStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useIntegrationStore.getState();
    expect(state.integrations).toEqual([]);
    expect(state.currentIntegration).toBeNull();
    expect(state.events).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('should add integration', () => {
    const { addIntegration } = useIntegrationStore.getState();
    const integration = { id: '1', name: 'Slack', type: 'communication', isActive: true };
    addIntegration(integration as any);
    expect(useIntegrationStore.getState().integrations).toHaveLength(1);
  });

  it('should update integration', () => {
    const store = useIntegrationStore.getState();
    store.setIntegrations([{ id: '1', name: 'Slack', isActive: true }] as any);
    store.updateIntegration('1', { isActive: false });
    expect(useIntegrationStore.getState().integrations[0].isActive).toBe(false);
  });

  it('should remove integration', () => {
    const store = useIntegrationStore.getState();
    store.setIntegrations([{ id: '1' }, { id: '2' }] as any);
    store.removeIntegration('1');
    expect(useIntegrationStore.getState().integrations).toHaveLength(1);
    expect(useIntegrationStore.getState().integrations[0].id).toBe('2');
  });

  it('should set current integration', () => {
    const { setCurrentIntegration } = useIntegrationStore.getState();
    const integration = { id: '1', name: 'Test' };
    setCurrentIntegration(integration as any);
    expect(useIntegrationStore.getState().currentIntegration).toEqual(integration);
  });

  it('should add event and limit to 100', () => {
    const { addEvent, setEvents } = useIntegrationStore.getState();
    const events = Array.from({ length: 100 }, (_, i) => ({ id: String(i) }));
    setEvents(events as any);
    addEvent({ id: 'new' } as any);
    expect(useIntegrationStore.getState().events).toHaveLength(100);
    expect(useIntegrationStore.getState().events[0].id).toBe('new');
  });

  it('should set and clear filters', () => {
    const store = useIntegrationStore.getState();
    store.setFilters({ type: 'communication' });
    expect(useIntegrationStore.getState().filters.type).toBe('communication');
    store.clearFilters();
    expect(useIntegrationStore.getState().filters).toEqual({});
  });
});
