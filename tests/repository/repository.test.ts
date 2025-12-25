import { InMemoryRepository } from '../../repository';
describe('Repository', () => {
  let repo: InMemoryRepository<{ id: string; name: string }>;
  beforeEach(() => { repo = new InMemoryRepository(); });
  it('should save and find', async () => {
    await repo.save({ id: '1', name: 'Test' });
    expect((await repo.findById('1'))?.name).toBe('Test');
  });
});
