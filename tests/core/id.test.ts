import { uuid, nanoid, shortId, prefixedId, timestampId } from '../../core/id';
describe('ID', () => {
  it('should generate uuid', () => { expect(uuid()).toMatch(/^[0-9a-f-]{36}$/); });
  it('should generate nanoid', () => { expect(nanoid()).toHaveLength(21); expect(nanoid(10)).toHaveLength(10); });
  it('should generate shortId', () => { expect(shortId()).toHaveLength(8); });
  it('should generate prefixedId', () => { expect(prefixedId('user')).toMatch(/^user_/); });
  it('should generate timestampId', () => { expect(timestampId().length).toBeGreaterThan(10); });
});
