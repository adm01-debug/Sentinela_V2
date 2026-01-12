import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('clipboard utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('copy to clipboard', () => {
    it('should copy text to clipboard using modern API', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', {
        clipboard: { writeText },
      });

      await navigator.clipboard.writeText('Hello World');
      expect(writeText).toHaveBeenCalledWith('Hello World');
    });

    it('should handle copy failure', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Copy failed'));
      vi.stubGlobal('navigator', {
        clipboard: { writeText },
      });

      await expect(navigator.clipboard.writeText('test')).rejects.toThrow('Copy failed');
    });

    it('should copy HTML content', async () => {
      const write = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', {
        clipboard: { write },
      });

      const item = { 'text/html': '<b>Bold</b>' };
      await navigator.clipboard.write([item] as any);
      expect(write).toHaveBeenCalled();
    });
  });

  describe('read from clipboard', () => {
    it('should read text from clipboard', async () => {
      const readText = vi.fn().mockResolvedValue('Clipboard content');
      vi.stubGlobal('navigator', {
        clipboard: { readText },
      });

      const result = await navigator.clipboard.readText();
      expect(result).toBe('Clipboard content');
    });

    it('should handle read failure', async () => {
      const readText = vi.fn().mockRejectedValue(new Error('Read denied'));
      vi.stubGlobal('navigator', {
        clipboard: { readText },
      });

      await expect(navigator.clipboard.readText()).rejects.toThrow('Read denied');
    });

    it('should read multiple formats', async () => {
      const read = vi.fn().mockResolvedValue([
        { types: ['text/plain', 'text/html'] },
      ]);
      vi.stubGlobal('navigator', {
        clipboard: { read },
      });

      const result = await navigator.clipboard.read();
      expect(result[0].types).toContain('text/plain');
    });
  });

  describe('clipboard permissions', () => {
    it('should check clipboard-read permission', async () => {
      const query = vi.fn().mockResolvedValue({ state: 'granted' });
      vi.stubGlobal('navigator', {
        permissions: { query },
      });

      const result = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      expect(result.state).toBe('granted');
    });

    it('should check clipboard-write permission', async () => {
      const query = vi.fn().mockResolvedValue({ state: 'granted' });
      vi.stubGlobal('navigator', {
        permissions: { query },
      });

      const result = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      expect(result.state).toBe('granted');
    });

    it('should handle denied permission', async () => {
      const query = vi.fn().mockResolvedValue({ state: 'denied' });
      vi.stubGlobal('navigator', {
        permissions: { query },
      });

      const result = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
      expect(result.state).toBe('denied');
    });
  });

  describe('fallback methods', () => {
    it('should use execCommand as fallback', () => {
      const execCommand = vi.fn().mockReturnValue(true);
      vi.stubGlobal('document', { execCommand });

      const result = document.execCommand('copy');
      expect(result).toBe(true);
    });

    it('should select text before copying', () => {
      const select = vi.fn();
      const input = { select, value: 'test' };
      input.select();
      expect(select).toHaveBeenCalled();
    });
  });
});
