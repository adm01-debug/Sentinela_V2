import { clamp, round, percentage, average, sum, inRange } from '../../core/number';
describe('Number', () => {
  it('should clamp', () => { expect(clamp(5, 0, 10)).toBe(5); expect(clamp(-5, 0, 10)).toBe(0); expect(clamp(15, 0, 10)).toBe(10); });
  it('should round', () => { expect(round(3.14159, 2)).toBe(3.14); });
  it('should calculate percentage', () => { expect(percentage(25, 100)).toBe(25); });
  it('should average', () => { expect(average(1, 2, 3)).toBe(2); });
  it('should sum', () => { expect(sum(1, 2, 3)).toBe(6); });
  it('should check inRange', () => { expect(inRange(5, 0, 10)).toBe(true); expect(inRange(15, 0, 10)).toBe(false); });
});
