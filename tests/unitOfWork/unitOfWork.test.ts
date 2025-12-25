import { UnitOfWork, TransactionScope } from '../../unitOfWork';

describe('UnitOfWork', () => {
  let uow: UnitOfWork;

  beforeEach(() => {
    uow = new UnitOfWork();
  });

  it('should track new entities', () => {
    uow.registerNew({ id: '1', name: 'Test' });
    expect(uow.hasChanges()).toBe(true);
  });

  it('should track dirty entities', () => {
    uow.registerDirty({ id: '1', name: 'Modified' });
    expect(uow.hasChanges()).toBe(true);
  });

  it('should track deleted entities', () => {
    uow.registerDeleted({ id: '1' });
    expect(uow.hasChanges()).toBe(true);
  });

  it('should commit changes', async () => {
    uow.registerNew({ id: '1', name: 'New' });
    uow.registerDirty({ id: '2', name: 'Updated' });
    
    await uow.commit();
    expect(uow.hasChanges()).toBe(false);
  });

  it('should rollback changes', () => {
    uow.registerNew({ id: '1', name: 'Test' });
    uow.rollback();
    
    expect(uow.hasChanges()).toBe(false);
  });
});

describe('TransactionScope', () => {
  it('should execute in transaction', async () => {
    const scope = new TransactionScope();
    const result = await scope.execute(async () => {
      return 'success';
    });
    
    expect(result).toBe('success');
  });

  it('should rollback on error', async () => {
    const scope = new TransactionScope();
    const rollback = jest.fn();
    
    await expect(
      scope.execute(async () => {
        throw new Error('fail');
      }, rollback)
    ).rejects.toThrow();
    
    expect(rollback).toHaveBeenCalled();
  });
});
