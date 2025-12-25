import { ok, err, tryCatch, tryCatchAsync, Result } from '../../core/result';

describe('Result', () => {
  it('should create Ok', () => {
    const r = ok(42);
    expect(r.isOk()).toBe(true);
    expect(r.unwrap()).toBe(42);
  });

  it('should create Err', () => {
    const r = err(new Error('fail'));
    expect(r.isErr()).toBe(true);
    expect(r.unwrapOr(0)).toBe(0);
  });

  it('should map Ok', () => {
    const r = ok(5).map(x => x * 2);
    expect(r.unwrap()).toBe(10);
  });

  it('should flatMap Ok', () => {
    const r = ok(5).flatMap(x => ok(x * 2));
    expect(r.unwrap()).toBe(10);
  });

  it('should tryCatch success', () => {
    const r = tryCatch(() => 42);
    expect(r.isOk()).toBe(true);
  });

  it('should tryCatch error', () => {
    const r = tryCatch(() => { throw new Error('fail'); });
    expect(r.isErr()).toBe(true);
  });

  it('should tryCatchAsync', async () => {
    const r = await tryCatchAsync(() => Promise.resolve(42));
    expect(r.unwrap()).toBe(42);
  });
});
