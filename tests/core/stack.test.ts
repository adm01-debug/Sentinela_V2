import { Stack } from '../../core/stack';
describe('Stack', () => {
  it('should push and pop', () => { const s = new Stack<number>(); s.push(1); s.push(2); expect(s.pop()).toBe(2); expect(s.pop()).toBe(1); });
  it('should peek', () => { const s = new Stack<number>(); s.push(1); expect(s.peek()).toBe(1); expect(s.size()).toBe(1); });
});
