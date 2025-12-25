import { hexToRgb, rgbToHex, lighten, darken } from '../../core/color';
describe('Color', () => {
  it('should convert hex to rgb', () => { expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 }); });
  it('should convert rgb to hex', () => { expect(rgbToHex(255, 0, 0)).toBe('#ff0000'); });
  it('should lighten', () => { expect(lighten('#808080', 10)).toBeDefined(); });
  it('should darken', () => { expect(darken('#808080', 10)).toBeDefined(); });
});
