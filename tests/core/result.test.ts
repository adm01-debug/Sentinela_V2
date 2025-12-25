import { ok, err, isOk, isErr } from '../../core/result';
describe('Result', () => {
  it('should handle ok', () => { const r = ok(42); expect(isOk(r)).toBe(true); expect(r.value).toBe(42); });
  it('should handle err', () => { const r = err('fail'); expect(isErr(r)).toBe(true); expect(r.error).toBe('fail'); });
});
