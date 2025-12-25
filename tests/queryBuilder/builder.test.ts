import { QueryBuilder } from '../../queryBuilder';
describe('QueryBuilder', () => {
  it('should build SQL queries', () => {
    const sql = new QueryBuilder()
      .select('id', 'name', 'email')
      .from('users')
      .where('active = true')
      .where('age > 18')
      .orderBy('name')
      .limit(10)
      .build();
    expect(sql).toContain('SELECT id, name, email');
    expect(sql).toContain('FROM users');
    expect(sql).toContain('WHERE active = true AND age > 18');
    expect(sql).toContain('LIMIT 10');
  });
});
