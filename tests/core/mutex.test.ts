import { Mutex } from '../../core/mutex';
describe('Mutex', () => {
  it('should provide exclusive access', async () => {
    const mutex = new Mutex();
    await mutex.lock();
    expect(mutex.isLocked()).toBe(true);
    mutex.unlock();
    expect(mutex.isLocked()).toBe(false);
  });
  it('should work with withLock', async () => {
    const mutex = new Mutex();
    const result = await mutex.withLock(async () => 42);
    expect(result).toBe(42);
    expect(mutex.isLocked()).toBe(false);
  });
});
