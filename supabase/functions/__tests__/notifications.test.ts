import { describe, it, expect } from 'vitest';
import { handler } from '../notifications';

describe('notifications edge function', () => {
  it('should return user notifications', async () => {
    const req = new Request('http://localhost/notifications', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(Array.isArray(data.notifications)).toBe(true);
  });

  it('should mark notification as read', async () => {
    const req = new Request('http://localhost/notifications/1/read', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('should return unread count', async () => {
    const req = new Request('http://localhost/notifications/count', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(typeof data.unreadCount).toBe('number');
  });
});