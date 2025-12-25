import { debounce, throttle } from '../../core/debounce';
describe('Debounce', () => {
  it('should debounce calls', async () => {
    let count = 0;
    const fn = debounce(() => count++, 50);
    fn(); fn(); fn();
    await new Promise(r => setTimeout(r, 100));
    expect(count).toBe(1);
  });
});
describe('Throttle', () => {
  it('should throttle calls', async () => {
    let count = 0;
    const fn = throttle(() => count++, 50);
    fn(); fn(); fn();
    expect(count).toBe(1);
  });
});
