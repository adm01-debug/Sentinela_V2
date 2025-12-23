export const colorHelpers = {
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null; },
  rgbToHex: (r: number, g: number, b: number): string => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''),
  random: (): string => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
};
