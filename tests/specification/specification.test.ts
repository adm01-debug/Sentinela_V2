import { Specification, AndSpecification, OrSpecification, NotSpecification } from '../../specification';

interface Product {
  name: string;
  price: number;
  inStock: boolean;
}

class PriceAbove implements Specification<Product> {
  constructor(private min: number) {}
  isSatisfiedBy(item: Product): boolean {
    return item.price > this.min;
  }
}

class InStock implements Specification<Product> {
  isSatisfiedBy(item: Product): boolean {
    return item.inStock;
  }
}

describe('Specification', () => {
  const expensive = new PriceAbove(100);
  const inStock = new InStock();

  const product1: Product = { name: 'A', price: 150, inStock: true };
  const product2: Product = { name: 'B', price: 50, inStock: true };
  const product3: Product = { name: 'C', price: 200, inStock: false };

  it('should check single specification', () => {
    expect(expensive.isSatisfiedBy(product1)).toBe(true);
    expect(expensive.isSatisfiedBy(product2)).toBe(false);
  });

  it('should combine with AND', () => {
    const spec = new AndSpecification(expensive, inStock);
    
    expect(spec.isSatisfiedBy(product1)).toBe(true);
    expect(spec.isSatisfiedBy(product3)).toBe(false);
  });

  it('should combine with OR', () => {
    const spec = new OrSpecification(expensive, inStock);
    
    expect(spec.isSatisfiedBy(product2)).toBe(true);
  });

  it('should negate with NOT', () => {
    const spec = new NotSpecification(expensive);
    
    expect(spec.isSatisfiedBy(product2)).toBe(true);
    expect(spec.isSatisfiedBy(product1)).toBe(false);
  });
});
