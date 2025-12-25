import { StreamProcessor } from '../../streamProcessing';
describe('StreamProcessor', () => {
  it('should process windowed data', () => {
    const processor = new StreamProcessor<number>({ windowSize: 3, slideInterval: 1 });
    processor.push(1);
    processor.push(2);
    processor.push(3);
    processor.push(4);
    expect(processor.window()).toEqual([2, 3, 4]);
    expect(processor.aggregate(items => items.reduce((a, b) => a + b, 0))).toBe(9);
  });
});
