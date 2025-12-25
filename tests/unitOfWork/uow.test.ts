import { UnitOfWork } from '../../unitOfWork';
describe('UnitOfWork', () => {
  let uow: UnitOfWork;
  beforeEach(() => { uow = new UnitOfWork(); });
  it('should track new entities', () => { uow.registerNew({ id: '1' }); expect(uow.hasChanges()).toBe(true); });
  it('should track dirty entities', () => { uow.registerDirty({ id: '1' }); expect(uow.hasChanges()).toBe(true); });
  it('should track deleted entities', () => { uow.registerDeleted({ id: '1' }); expect(uow.hasChanges()).toBe(true); });
  it('should commit changes', async () => { uow.registerNew({ id: '1' }); await uow.commit(); expect(uow.hasChanges()).toBe(false); });
});
