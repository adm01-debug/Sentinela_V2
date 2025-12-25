import { pipeline, pipe, compose, Pipeline } from '../../core/pipeline';

describe('Pipeline', () => {
  it('should execute steps', async () => {
    const p = pipeline<number>()
      .pipe(x => x * 2)
      .pipe(x => x + 1);
    expect(await p.execute(5)).toBe(11);
  });

  it('should execute sync', () => {
    const p = pipeline<string>()
      .pipe(s => s.toUpperCase())
      .pipe(s => s + '!');
    expect(p.executeSync('hello')).toBe('HELLO!');
  });
});

describe('pipe', () => {
  it('should compose left-to-right', () => {
    const fn = pipe<number>(x => x * 2, x => x + 1);
    expect(fn(5)).toBe(11);
  });
});

describe('compose', () => {
  it('should compose right-to-left', () => {
    const fn = compose<number>(x => x + 1, x => x * 2);
    expect(fn(5)).toBe(11);
  });
});
