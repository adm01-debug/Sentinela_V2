import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebSocketClient } from '../websocket/client';
describe('WebSocketClient', () => {
  let client: WebSocketClient;
  beforeEach(() => { client = new WebSocketClient('ws://localhost'); });
  it('creates instance', () => { expect(client).toBeDefined(); });
});