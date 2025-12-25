import { money, add, subtract, multiply, format } from '../../core/money';
describe('Money', () => {
  it('should create money', () => { expect(money(1000, 'USD')).toEqual({ amount: 1000, currency: 'USD' }); });
  it('should add money', () => { expect(add(money(100), money(200))).toEqual({ amount: 300, currency: 'USD' }); });
  it('should subtract money', () => { expect(subtract(money(300), money(100))).toEqual({ amount: 200, currency: 'USD' }); });
  it('should multiply money', () => { expect(multiply(money(100), 2)).toEqual({ amount: 200, currency: 'USD' }); });
  it('should format money', () => { expect(format(money(1000))).toContain('10'); });
});
