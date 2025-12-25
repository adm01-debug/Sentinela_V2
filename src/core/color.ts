/**
 * @fileoverview Color utilities
 * @module @sentinela/core/color
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}
export function rgbToHex(r: number, g: number, b: number): string { return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); }
export function lighten(hex: string, percent: number): string { const rgb = hexToRgb(hex); if (!rgb) return hex; const amt = Math.round(2.55 * percent); return rgbToHex(Math.min(255, rgb.r + amt), Math.min(255, rgb.g + amt), Math.min(255, rgb.b + amt)); }
export function darken(hex: string, percent: number): string { return lighten(hex, -percent); }
