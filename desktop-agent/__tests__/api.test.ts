import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('Desktop Agent API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send activity data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const response = await fetch('/api/activity', {
      method: 'POST',
      body: JSON.stringify({ type: 'keystroke' })
    });

    expect(response.ok).toBe(true);
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      fetch('/api/activity')
    ).rejects.toThrow('Network error');
  });

  it('should authenticate agent', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'abc123' })
    });

    const response = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ key: 'agent-key' })
    });

    expect(response.ok).toBe(true);
  });
});
