import { MinHeap } from '../../core/heap';
describe('MinHeap', () => {
  it('should maintain min order', () => {
    const h = new MinHeap<number>();
    h.push(3); h.push(1); h.push(2);
    expect(h.pop()).toBe(1);
    expect(h.pop()).toBe(2);
    expect(h.pop()).toBe(3);
  });
  it('should peek without removing', () => {
    const h = new MinHeap<number>();
    h.push(5); h.push(3);
    expect(h.peek()).toBe(3);
    expect(h.size()).toBe(2);
  });
});
