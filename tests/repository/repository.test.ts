import { Repository } from '../../repository';

interface User { id: string; name: string; email: string; }

describe('Repository', () => {
  let repo: Repository<User>;
  beforeEach(() => { repo = new Repository<User>(); });

  it('should create and find by id', async () => {
    const user = { id: '1', name: 'John', email: 'john@test.com' };
    await repo.save(user);
    const found = await repo.findById('1');
    expect(found).toEqual(user);
  });

  it('should update entity', async () => {
    await repo.save({ id: '1', name: 'John', email: 'john@test.com' });
    await repo.save({ id: '1', name: 'Jane', email: 'jane@test.com' });
    const found = await repo.findById('1');
    expect(found?.name).toBe('Jane');
  });

  it('should delete entity', async () => {
    await repo.save({ id: '1', name: 'John', email: 'john@test.com' });
    await repo.delete('1');
    const found = await repo.findById('1');
    expect(found).toBeUndefined();
  });

  it('should find all', async () => {
    await repo.save({ id: '1', name: 'John', email: 'j@t.com' });
    await repo.save({ id: '2', name: 'Jane', email: 'ja@t.com' });
    const all = await repo.findAll();
    expect(all.length).toBe(2);
  });
});
