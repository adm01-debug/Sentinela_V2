import { pipe, compose } from '../../core/pipeline';
describe('Pipeline', () => {
  it('should pipe functions', () => { const result = pipe(5, x => x * 2, x => x + 1); expect(result).toBe(11); });
  it('should compose functions', () => { const fn = compose((x: number) => x + 1, x => x * 2); expect(fn(5)).toBe(11); });
});
