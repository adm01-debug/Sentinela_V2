import { assert, assertDefined, AssertionError } from '../../core/assert';
describe('Assert', () => {
  it('should pass on true', () => { expect(() => assert(true)).not.toThrow(); });
  it('should throw on false', () => { expect(() => assert(false)).toThrow(AssertionError); });
  it('should assert defined', () => { expect(() => assertDefined('value')).not.toThrow(); expect(() => assertDefined(undefined)).toThrow(AssertionError); });
});
