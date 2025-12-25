import { DomainEventDispatcher, DomainEventHandler } from '../../domainEvents';

interface UserCreated { type: 'UserCreated'; userId: string; email: string; }
interface UserDeleted { type: 'UserDeleted'; userId: string; }

describe('DomainEventDispatcher', () => {
  let dispatcher: DomainEventDispatcher;
  beforeEach(() => { dispatcher = new DomainEventDispatcher(); });

  it('should dispatch to registered handlers', async () => {
    const handler = jest.fn();
    dispatcher.register('UserCreated', handler);
    
    await dispatcher.dispatch({ type: 'UserCreated', userId: '1', email: 'test@test.com' });
    
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ userId: '1' }));
  });

  it('should dispatch to multiple handlers', async () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    dispatcher.register('UserCreated', h1);
    dispatcher.register('UserCreated', h2);
    
    await dispatcher.dispatch({ type: 'UserCreated', userId: '1', email: 't@t.com' });
    
    expect(h1).toHaveBeenCalled();
    expect(h2).toHaveBeenCalled();
  });

  it('should unregister handlers', async () => {
    const handler = jest.fn();
    const unsub = dispatcher.register('UserCreated', handler);
    unsub();
    
    await dispatcher.dispatch({ type: 'UserCreated', userId: '1', email: 't@t.com' });
    
    expect(handler).not.toHaveBeenCalled();
  });
});
