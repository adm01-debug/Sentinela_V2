import { QueryBuilder, Query, WhereClause } from '../../queryBuilder';
describe('QueryBuilder', () => {
  let builder: QueryBuilder;
  beforeEach(() => { builder = new QueryBuilder('users'); });
  it('should build select query', () => {
    const query = builder.select(['id', 'name', 'email']).build();
    expect(query.sql).toContain('SELECT id, name, email FROM users');
  });
  it('should add where clause', () => {
    const query = builder.select(['*']).where('id', '=', 1).build();
    expect(query.sql).toContain('WHERE id = ?');
    expect(query.params).toContain(1);
  });
  it('should chain conditions', () => {
    const query = builder.select(['*']).where('status', '=', 'active').and('age', '>', 18).build();
    expect(query.sql).toContain('AND');
  });
  it('should add order by', () => {
    const query = builder.select(['*']).orderBy('created_at', 'DESC').build();
    expect(query.sql).toContain('ORDER BY created_at DESC');
  });
  it('should add limit and offset', () => {
    const query = builder.select(['*']).limit(10).offset(20).build();
    expect(query.sql).toContain('LIMIT 10');
    expect(query.sql).toContain('OFFSET 20');
  });
  it('should build insert query', () => {
    const query = builder.insert({ name: 'John', email: 'john@test.com' }).build();
    expect(query.sql).toContain('INSERT INTO users');
  });
  it('should build update query', () => {
    const query = builder.update({ name: 'Jane' }).where('id', '=', 1).build();
    expect(query.sql).toContain('UPDATE users SET');
  });
  it('should build delete query', () => {
    const query = builder.delete().where('id', '=', 1).build();
    expect(query.sql).toContain('DELETE FROM users');
  });
});