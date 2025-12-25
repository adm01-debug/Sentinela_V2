import { RingBuffer } from '../../core/ring-buffer';
describe('RingBuffer', () => {
  it('should wrap around', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3); rb.push(4);
    expect(rb.shift()).toBe(2);
    expect(rb.size()).toBe(2);
  });
});
