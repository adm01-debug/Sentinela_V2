import { Deque } from '../../core/deque';
describe('Deque', () => {
  it('should push and pop from both ends', () => {
    const d = new Deque<number>();
    d.pushBack(1); d.pushBack(2); d.pushFront(0);
    expect(d.popFront()).toBe(0);
    expect(d.popBack()).toBe(2);
  });
});
