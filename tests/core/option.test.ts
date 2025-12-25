import { some, none, isSome, isNone } from '../../core/option';
describe('Option', () => {
  it('should handle some', () => { const o = some(42); expect(isSome(o)).toBe(true); expect(o.value).toBe(42); });
  it('should handle none', () => { const o = none(); expect(isNone(o)).toBe(true); });
});
