import { BaseRepository } from '../../src/repository';

interface User {
  id: string;
  name: string;
  email: string;
}

class InMemoryUserRepository extends BaseRepository<User, string> {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(entity: User): Promise<User> {
    this.users.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }
}

describe('Repository', () => {
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
  });

  it('should save and find entity', async () => {
    const user: User = { id: '1', name: 'John', email: 'john@example.com' };
    await repo.save(user);
    
    const found = await repo.findById('1');
    expect(found).toEqual(user);
  });

  it('should return null for non-existent', async () => {
    const found = await repo.findById('999');
    expect(found).toBeNull();
  });

  it('should delete entity', async () => {
    await repo.save({ id: '1', name: 'John', email: 'john@example.com' });
    await repo.delete('1');
    
    const found = await repo.findById('1');
    expect(found).toBeNull();
  });

  it('should check existence', async () => {
    await repo.save({ id: '1', name: 'John', email: 'john@example.com' });
    
    expect(await repo.exists('1')).toBe(true);
    expect(await repo.exists('999')).toBe(false);
  });

  it('should find all', async () => {
    await repo.save({ id: '1', name: 'John', email: 'john@example.com' });
    await repo.save({ id: '2', name: 'Jane', email: 'jane@example.com' });
    
    const all = await repo.findAll();
    expect(all.length).toBe(2);
  });
});
