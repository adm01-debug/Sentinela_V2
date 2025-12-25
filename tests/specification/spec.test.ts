import { spec, Specification } from '../../specification';
describe('Specification', () => {
  const isPositive = spec<number>(n => n > 0);
  const isEven = spec<number>(n => n % 2 === 0);
  it('should check single spec', () => { expect(isPositive.isSatisfiedBy(5)).toBe(true); });
  it('should combine with and', () => { expect(isPositive.and(isEven).isSatisfiedBy(4)).toBe(true); });
  it('should combine with or', () => { expect(isPositive.or(isEven).isSatisfiedBy(-2)).toBe(true); });
  it('should negate with not', () => { expect(isPositive.not().isSatisfiedBy(-5)).toBe(true); });
});
