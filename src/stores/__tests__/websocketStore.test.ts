import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWebSocketStore } from '../websocketStore';
describe('websocketStore', () => {
  beforeEach(() => { useWebSocketStore.setState({ status: 'disconnected', socket: null }); });
  it('initial state', () => { expect(useWebSocketStore.getState().status).toBe('disconnected'); });
  it('sets status', () => { useWebSocketStore.getState().setStatus('connected'); expect(useWebSocketStore.getState().status).toBe('connected'); });
});