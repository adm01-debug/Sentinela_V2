import { QueryBuilder } from '../../src/queryBuilder';

describe('QueryBuilder', () => {
  it('should build SELECT query', () => {
    const builder = new QueryBuilder();
    
    const query = builder
      .select(['id', 'name', 'email'])
      .from('users')
      .where('active', '=', true)
      .orderBy('created_at', 'DESC')
      .limit(10)
      .build();

    expect(query.sql).toContain('SELECT');
    expect(query.sql).toContain('FROM users');
    expect(query.sql).toContain('WHERE');
    expect(query.sql).toContain('ORDER BY');
    expect(query.sql).toContain('LIMIT');
  });

  it('should build INSERT query', () => {
    const builder = new QueryBuilder();
    
    const query = builder
      .insert('users')
      .values({ name: 'John', email: 'john@example.com' })
      .build();

    expect(query.sql).toContain('INSERT INTO users');
    expect(query.params).toContain('John');
  });

  it('should build UPDATE query', () => {
    const builder = new QueryBuilder();
    
    const query = builder
      .update('users')
      .set({ name: 'Jane' })
      .where('id', '=', 1)
      .build();

    expect(query.sql).toContain('UPDATE users');
    expect(query.sql).toContain('SET');
    expect(query.sql).toContain('WHERE');
  });

  it('should handle multiple WHERE conditions', () => {
    const builder = new QueryBuilder();
    
    const query = builder
      .select(['*'])
      .from('orders')
      .where('status', '=', 'active')
      .where('total', '>', 100)
      .build();

    expect(query.sql).toContain('AND');
  });
});
