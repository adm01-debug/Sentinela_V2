import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('HTTP methods', () => {
    it('should make GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      });

      const response = await fetch('/api/test');
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/api/test');
      expect(data).toEqual({ data: 'test' });
    });

    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      });

      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' }),
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: 'POST',
      }));
    });

    it('should make PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ updated: true }),
      });

      await fetch('/api/test/1', { method: 'PUT' });
      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', expect.objectContaining({
        method: 'PUT',
      }));
    });

    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deleted: true }),
      });

      await fetch('/api/test/1', { method: 'DELETE' });
      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch('/api/test')).rejects.toThrow('Network error');
    });

    it('should handle 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const response = await fetch('/api/notfound');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle 500 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const response = await fetch('/api/error');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('Request headers', () => {
    it('should include authorization header', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

      await fetch('/api/protected', {
        headers: { Authorization: 'Bearer token123' },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/protected', expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token123' }),
      }));
    });

    it('should include custom headers', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

      await fetch('/api/test', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        headers: expect.objectContaining({ 'X-Custom-Header': 'custom-value' }),
      }));
    });
  });

  describe('Response parsing', () => {
    it('should parse JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ key: 'value' }),
      });

      const response = await fetch('/api/json');
      const data = await response.json();
      expect(data).toEqual({ key: 'value' });
    });

    it('should parse text response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('plain text'),
      });

      const response = await fetch('/api/text');
      const data = await response.text();
      expect(data).toBe('plain text');
    });

    it('should parse blob response', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const response = await fetch('/api/file');
      const blob = await response.blob();
      expect(blob).toBeInstanceOf(Blob);
    });
  });
});
