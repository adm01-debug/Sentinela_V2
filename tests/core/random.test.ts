import { int, float, bool, pick, shuffle, sample } from '../../core/random';
describe('Random', () => {
  it('should generate int in range', () => { for (let i = 0; i < 100; i++) { const n = int(1, 10); expect(n).toBeGreaterThanOrEqual(1); expect(n).toBeLessThanOrEqual(10); } });
  it('should generate float in range', () => { for (let i = 0; i < 100; i++) { const n = float(0, 1); expect(n).toBeGreaterThanOrEqual(0); expect(n).toBeLessThan(1); } });
  it('should pick from array', () => { const arr = [1, 2, 3]; expect(arr).toContain(pick(arr)); });
  it('should shuffle', () => { const arr = [1, 2, 3, 4, 5]; expect(shuffle(arr).sort()).toEqual(arr); });
  it('should sample', () => { const arr = [1, 2, 3, 4, 5]; expect(sample(arr, 3)).toHaveLength(3); });
});
