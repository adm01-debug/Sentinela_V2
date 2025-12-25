import { PriorityQueue } from '../../core/queue';
describe('PriorityQueue', () => {
  it('should order by priority', () => {
    const q = new PriorityQueue<string>();
    q.enqueue('low', 1);
    q.enqueue('high', 10);
    q.enqueue('medium', 5);
    expect(q.dequeue()).toBe('high');
    expect(q.dequeue()).toBe('medium');
    expect(q.dequeue()).toBe('low');
  });
});
