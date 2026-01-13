// Visual accessibility utilities
export const colorContrast = {
  getLuminance: (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  getContrastRatio: (l1: number, l2: number) => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },
  meetsWCAG: (ratio: number, level: 'AA' | 'AAA' = 'AA', isLargeText = false) => {
    const thresholds = { AA: isLargeText ? 3 : 4.5, AAA: isLargeText ? 4.5 : 7 };
    return ratio >= thresholds[level];
  }
};

export const reducedMotion = {
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  getTransition: (duration: number) => reducedMotion.prefersReducedMotion() ? 'none' : `all ${duration}ms ease`,
};

export const highContrast = {
  prefersHighContrast: () => window.matchMedia('(prefers-contrast: more)').matches,
  getColors: () => highContrast.prefersHighContrast() ? { bg: '#000', fg: '#fff', border: '#fff' } : { bg: '#fff', fg: '#333', border: '#e8e8e8' },
};

export const textScaling = {
  baseSize: 16,
  scale: (multiplier: number) => `${textScaling.baseSize * multiplier}px`,
  responsive: (min: number, max: number, vw: number = 100) => `clamp(${min}px, ${vw}vw, ${max}px)`,
};
