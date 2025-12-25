import { BatchProcessor } from '../../core/batch';
describe('BatchProcessor', () => {
  it('should batch items', async () => {
    const processor = new BatchProcessor<number, number>(async (items) => items.map(i => i * 2), { maxSize: 3, maxWait: 1000 });
    const results = await Promise.all([processor.add(1), processor.add(2), processor.add(3)]);
    expect(results).toEqual([2, 4, 6]);
  });
});
