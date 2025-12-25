import { Timer, measure, measureAsync } from '../../core/timer';
describe('Timer', () => {
  it('should measure time', async () => { const timer = new Timer(); timer.begin(); await new Promise(r => setTimeout(r, 50)); const elapsed = timer.stop(); expect(elapsed).toBeGreaterThanOrEqual(50); });
  it('should measure function', () => { const { result, time } = measure(() => { let sum = 0; for (let i = 0; i < 1000; i++) sum += i; return sum; }); expect(result).toBe(499500); expect(time).toBeGreaterThanOrEqual(0); });
});
