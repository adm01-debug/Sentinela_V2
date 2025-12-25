import { bytes, duration, number, percent, ordinal } from '../../core/format';
describe('Format', () => {
  it('should format bytes', () => { expect(bytes(1024)).toBe('1.00 KB'); expect(bytes(1048576)).toBe('1.00 MB'); });
  it('should format duration', () => { expect(duration(500)).toBe('500ms'); expect(duration(5000)).toBe('5.0s'); });
  it('should format number', () => { expect(number(1000000)).toBe('1,000,000'); });
  it('should format percent', () => { expect(percent(25, 100)).toBe('25.0%'); });
  it('should format ordinal', () => { expect(ordinal(1)).toBe('1st'); expect(ordinal(2)).toBe('2nd'); expect(ordinal(3)).toBe('3rd'); expect(ordinal(4)).toBe('4th'); });
});
