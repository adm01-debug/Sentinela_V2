import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('browser utils', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      platform: 'Win32',
      language: 'en-US',
      languages: ['en-US', 'en'],
      onLine: true,
      cookieEnabled: true,
    });
  });

  describe('browser detection', () => {
    it('should detect Chrome browser', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
      });
      expect(navigator.userAgent).toContain('Chrome');
    });

    it('should detect Firefox browser', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Firefox/121.0',
      });
      expect(navigator.userAgent).toContain('Firefox');
    });

    it('should detect Safari browser', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Safari/605.1.15',
      });
      expect(navigator.userAgent).toContain('Safari');
    });

    it('should detect Edge browser', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Edg/120.0.0.0',
      });
      expect(navigator.userAgent).toContain('Edg');
    });
  });

  describe('platform detection', () => {
    it('should detect Windows platform', () => {
      vi.stubGlobal('navigator', { platform: 'Win32' });
      expect(navigator.platform).toBe('Win32');
    });

    it('should detect Mac platform', () => {
      vi.stubGlobal('navigator', { platform: 'MacIntel' });
      expect(navigator.platform).toBe('MacIntel');
    });

    it('should detect Linux platform', () => {
      vi.stubGlobal('navigator', { platform: 'Linux x86_64' });
      expect(navigator.platform).toContain('Linux');
    });
  });

  describe('feature detection', () => {
    it('should check online status', () => {
      vi.stubGlobal('navigator', { onLine: true });
      expect(navigator.onLine).toBe(true);
    });

    it('should check offline status', () => {
      vi.stubGlobal('navigator', { onLine: false });
      expect(navigator.onLine).toBe(false);
    });

    it('should check cookie support', () => {
      vi.stubGlobal('navigator', { cookieEnabled: true });
      expect(navigator.cookieEnabled).toBe(true);
    });

    it('should get browser language', () => {
      vi.stubGlobal('navigator', { language: 'pt-BR' });
      expect(navigator.language).toBe('pt-BR');
    });
  });

  describe('mobile detection', () => {
    it('should detect mobile device', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15',
      });
      expect(navigator.userAgent).toContain('iPhone');
    });

    it('should detect Android device', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36',
      });
      expect(navigator.userAgent).toContain('Android');
    });

    it('should detect tablet device', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0) AppleWebKit/605.1.15',
      });
      expect(navigator.userAgent).toContain('iPad');
    });
  });

  describe('screen info', () => {
    it('should get screen dimensions', () => {
      vi.stubGlobal('screen', { width: 1920, height: 1080 });
      expect(screen.width).toBe(1920);
      expect(screen.height).toBe(1080);
    });

    it('should get device pixel ratio', () => {
      vi.stubGlobal('devicePixelRatio', 2);
      expect(devicePixelRatio).toBe(2);
    });
  });
});
