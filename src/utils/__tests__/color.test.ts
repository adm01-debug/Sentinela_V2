import { describe, it, expect } from 'vitest';

describe('color utils', () => {
  it('should convert hex to rgb', () => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('should convert rgb to hex', () => {
    const rgbToHex = (r: number, g: number, b: number) => {
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    };
    
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
  });

  it('should check if color is light', () => {
    const isLight = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return false;
      const [r, g, b] = result.slice(1).map(x => parseInt(x, 16));
      return (r * 299 + g * 587 + b * 114) / 1000 > 128;
    };
    
    expect(isLight('#ffffff')).toBe(true);
    expect(isLight('#000000')).toBe(false);
  });
});
