import { Specification, AndSpecification, OrSpecification, NotSpecification } from '../../specification';

interface Product { price: number; category: string; inStock: boolean; }

describe('Specification', () => {
  const expensiveSpec = new Specification<Product>(p => p.price > 100);
  const electronicsSpec = new Specification<Product>(p => p.category === 'electronics');
  const inStockSpec = new Specification<Product>(p => p.inStock);

  const expensiveElectronics: Product = { price: 500, category: 'electronics', inStock: true };
  const cheapClothing: Product = { price: 20, category: 'clothing', inStock: false };

  it('should satisfy single specification', () => {
    expect(expensiveSpec.isSatisfiedBy(expensiveElectronics)).toBe(true);
    expect(expensiveSpec.isSatisfiedBy(cheapClothing)).toBe(false);
  });

  it('should combine with AND', () => {
    const spec = expensiveSpec.and(electronicsSpec);
    expect(spec.isSatisfiedBy(expensiveElectronics)).toBe(true);
    expect(spec.isSatisfiedBy(cheapClothing)).toBe(false);
  });

  it('should combine with OR', () => {
    const spec = expensiveSpec.or(electronicsSpec);
    expect(spec.isSatisfiedBy(expensiveElectronics)).toBe(true);
  });

  it('should negate with NOT', () => {
    const spec = expensiveSpec.not();
    expect(spec.isSatisfiedBy(cheapClothing)).toBe(true);
  });
});
