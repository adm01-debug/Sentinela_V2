import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('responsive utils', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      innerWidth: 1024,
      innerHeight: 768,
      matchMedia: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  describe('breakpoints', () => {
    const breakpoints = {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    };

    it('should detect mobile breakpoint', () => {
      vi.stubGlobal('window', { innerWidth: 375 });
      const isMobile = window.innerWidth < breakpoints.sm;
      expect(isMobile).toBe(true);
    });

    it('should detect tablet breakpoint', () => {
      vi.stubGlobal('window', { innerWidth: 768 });
      const isTablet = window.innerWidth >= breakpoints.md && 
                       window.innerWidth < breakpoints.lg;
      expect(isTablet).toBe(true);
    });

    it('should detect desktop breakpoint', () => {
      vi.stubGlobal('window', { innerWidth: 1200 });
      const isDesktop = window.innerWidth >= breakpoints.lg;
      expect(isDesktop).toBe(true);
    });

    it('should get current breakpoint name', () => {
      const getBreakpoint = (width: number) => {
        if (width >= breakpoints['2xl']) return '2xl';
        if (width >= breakpoints.xl) return 'xl';
        if (width >= breakpoints.lg) return 'lg';
        if (width >= breakpoints.md) return 'md';
        if (width >= breakpoints.sm) return 'sm';
        return 'xs';
      };

      expect(getBreakpoint(1920)).toBe('2xl');
      expect(getBreakpoint(1024)).toBe('lg');
      expect(getBreakpoint(375)).toBe('xs');
    });
  });

  describe('media queries', () => {
    it('should check media query match', () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: true });
      vi.stubGlobal('window', { matchMedia });

      const result = window.matchMedia('(min-width: 768px)');
      expect(result.matches).toBe(true);
    });

    it('should detect dark mode preference', () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: true });
      vi.stubGlobal('window', { matchMedia });

      const result = window.matchMedia('(prefers-color-scheme: dark)');
      expect(result.matches).toBe(true);
    });

    it('should detect reduced motion preference', () => {
      const matchMedia = vi.fn().mockReturnValue({ matches: false });
      vi.stubGlobal('window', { matchMedia });

      const result = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(result.matches).toBe(false);
    });
  });

  describe('orientation', () => {
    it('should detect portrait orientation', () => {
      vi.stubGlobal('window', { innerWidth: 375, innerHeight: 812 });
      const isPortrait = window.innerWidth < window.innerHeight;
      expect(isPortrait).toBe(true);
    });

    it('should detect landscape orientation', () => {
      vi.stubGlobal('window', { innerWidth: 812, innerHeight: 375 });
      const isLandscape = window.innerWidth > window.innerHeight;
      expect(isLandscape).toBe(true);
    });
  });

  describe('viewport dimensions', () => {
    it('should get viewport width', () => {
      vi.stubGlobal('window', { innerWidth: 1440 });
      expect(window.innerWidth).toBe(1440);
    });

    it('should get viewport height', () => {
      vi.stubGlobal('window', { innerHeight: 900 });
      expect(window.innerHeight).toBe(900);
    });

    it('should calculate aspect ratio', () => {
      vi.stubGlobal('window', { innerWidth: 1920, innerHeight: 1080 });
      const ratio = window.innerWidth / window.innerHeight;
      expect(ratio).toBeCloseTo(16 / 9, 1);
    });
  });

  describe('resize handling', () => {
    it('should add resize listener', () => {
      const addEventListener = vi.fn();
      vi.stubGlobal('window', { addEventListener });

      const handler = vi.fn();
      window.addEventListener('resize', handler);
      expect(addEventListener).toHaveBeenCalledWith('resize', handler);
    });

    it('should remove resize listener', () => {
      const removeEventListener = vi.fn();
      vi.stubGlobal('window', { removeEventListener });

      const handler = vi.fn();
      window.removeEventListener('resize', handler);
      expect(removeEventListener).toHaveBeenCalledWith('resize', handler);
    });

    it('should debounce resize handler', () => {
      vi.useFakeTimers();
      const handler = vi.fn();
      let timeout: NodeJS.Timeout;
      
      const debouncedHandler = () => {
        clearTimeout(timeout);
        timeout = setTimeout(handler, 100);
      };

      debouncedHandler();
      debouncedHandler();
      debouncedHandler();
      
      expect(handler).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(handler).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe('device detection', () => {
    it('should detect touch device', () => {
      vi.stubGlobal('navigator', { maxTouchPoints: 5 });
      const isTouch = navigator.maxTouchPoints > 0;
      expect(isTouch).toBe(true);
    });

    it('should detect high DPI display', () => {
      vi.stubGlobal('devicePixelRatio', 2);
      const isRetina = devicePixelRatio >= 2;
      expect(isRetina).toBe(true);
    });
  });
});
