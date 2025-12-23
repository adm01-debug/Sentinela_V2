export const colorHelpers = {
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  },
  rgbToHex: (r: number, g: number, b: number): string => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''),
  lighten: (hex: string, amount: number): string => {
    const rgb = colorHelpers.hexToRgb(hex);
    if (!rgb) return hex;
    const { r, g, b } = rgb;
    return colorHelpers.rgbToHex(Math.min(255, r + amount), Math.min(255, g + amount), Math.min(255, b + amount));
  },
  darken: (hex: string, amount: number): string => {
    const rgb = colorHelpers.hexToRgb(hex);
    if (!rgb) return hex;
    const { r, g, b } = rgb;
    return colorHelpers.rgbToHex(Math.max(0, r - amount), Math.max(0, g - amount), Math.max(0, b - amount));
  },
};
