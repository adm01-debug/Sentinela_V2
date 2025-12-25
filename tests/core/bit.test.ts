import { getBit, setBit, clearBit, countBits, isPowerOfTwo } from '../../core/bit';
describe('Bit', () => {
  it('should get bit', () => { expect(getBit(5, 0)).toBe(1); expect(getBit(5, 1)).toBe(0); expect(getBit(5, 2)).toBe(1); });
  it('should set bit', () => { expect(setBit(5, 1)).toBe(7); });
  it('should clear bit', () => { expect(clearBit(7, 1)).toBe(5); });
  it('should count bits', () => { expect(countBits(7)).toBe(3); expect(countBits(8)).toBe(1); });
  it('should check power of two', () => { expect(isPowerOfTwo(8)).toBe(true); expect(isPowerOfTwo(7)).toBe(false); });
});
