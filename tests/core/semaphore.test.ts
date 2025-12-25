import { Semaphore } from '../../core/semaphore';
describe('Semaphore', () => {
  it('should limit concurrent access', async () => {
    const sem = new Semaphore(2);
    await sem.acquire();
    await sem.acquire();
    expect(sem.available()).toBe(0);
    sem.release();
    expect(sem.available()).toBe(1);
  });
});
