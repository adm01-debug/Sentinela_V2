export class ContrastChecker {
  getContrastRatio(color1: string, color2: string): number { const l1 = this.getLuminance(color1); const l2 = this.getLuminance(color2); const lighter = Math.max(l1, l2); const darker = Math.min(l1, l2); return (lighter + 0.05) / (darker + 0.05); }
  private getLuminance(hex: string): number { const rgb = this.hexToRgb(hex); const [r, g, b] = rgb.map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
  private hexToRgb(hex: string): number[] { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0]; }
  meetsWCAG(ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean { return level === 'AAA' ? ratio >= 7 : ratio >= 4.5; }
}
export const contrastChecker = new ContrastChecker();
