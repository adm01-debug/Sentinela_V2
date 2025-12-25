import { addDays, addHours, isExpired } from '../../core/date';
describe('Date', () => {
  it('should add days', () => { const d = new Date('2024-01-01'); expect(addDays(d, 1).getDate()).toBe(2); });
  it('should add hours', () => { const d = new Date('2024-01-01T00:00:00'); expect(addHours(d, 1).getHours()).toBe(1); });
  it('should check expired', () => { expect(isExpired(new Date('2020-01-01'))).toBe(true); });
});
