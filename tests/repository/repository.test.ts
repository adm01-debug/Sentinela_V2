import { Repository, QueryRepository } from '../../repository';

interface User {
  id: string;
  name: string;
  email: string;
}

describe('Repository', () => {
  let repo: Repository<User>;

  beforeEach(() => {
    repo = new Repository<User>();
  });

  it('should save and find by id', async () => {
    const user = { id: '1', name: 'John', email: 'john@test.com' };
    await repo.save(user);
    
    const found = await repo.findById('1');
    expect(found).toEqual(user);
  });

  it('should delete entity', async () => {
    await repo.save({ id: '1', name: 'Test', email: 'test@test.com' });
    await repo.delete('1');
    
    const found = await repo.findById('1');
    expect(found).toBeNull();
  });

  it('should check existence', async () => {
    await repo.save({ id: '1', name: 'Test', email: 'test@test.com' });
    
    expect(await repo.exists('1')).toBe(true);
    expect(await repo.exists('999')).toBe(false);
  });
});

describe('QueryRepository', () => {
  let repo: QueryRepository<User>;

  beforeEach(() => {
    repo = new QueryRepository<User>();
    repo.save({ id: '1', name: 'Alice', email: 'alice@test.com' });
    repo.save({ id: '2', name: 'Bob', email: 'bob@test.com' });
    repo.save({ id: '3', name: 'Alice', email: 'alice2@test.com' });
  });

  it('should find by criteria', async () => {
    const results = await repo.findBy({ name: 'Alice' });
    expect(results.length).toBe(2);
  });

  it('should find all', async () => {
    const all = await repo.findAll();
    expect(all.length).toBe(3);
  });
});
