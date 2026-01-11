import { describe, it, expect, beforeEach } from 'vitest';
import { useAlertStore } from '../alertStore';
describe('alertStore', () => {
  beforeEach(() => { useAlertStore.setState({ alerts: [], unacknowledgedCount: 0 }); });
  it('adds alert', () => { useAlertStore.getState().addAlert({ id: '1', type: 'security', severity: 'high', title: 'Test', message: 'Test msg', acknowledged: false, createdAt: new Date().toISOString() }); expect(useAlertStore.getState().alerts).toHaveLength(1); expect(useAlertStore.getState().unacknowledgedCount).toBe(1); });
  it('acknowledges alert', () => { useAlertStore.getState().addAlert({ id: '1', type: 'security', severity: 'high', title: 'Test', message: 'Test msg', acknowledged: false, createdAt: new Date().toISOString() }); useAlertStore.getState().acknowledgeAlert('1'); expect(useAlertStore.getState().alerts[0].acknowledged).toBe(true); });
});