import { describe, it, expect } from 'vitest';
import { handler } from '../webhooks';

describe('webhooks edge function', () => {
  it('should validate webhook signature', async () => {
    const req = new Request('http://localhost/webhooks', {
      method: 'POST',
      headers: { 'X-Webhook-Signature': 'invalid' },
      body: JSON.stringify({ event: 'test' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(401);
  });

  it('should process valid webhook', async () => {
    const req = new Request('http://localhost/webhooks', {
      method: 'POST',
      headers: { 'X-Webhook-Signature': 'valid_signature', 'X-Webhook-Event': 'violation.created' },
      body: JSON.stringify({ data: { id: 1 } }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});