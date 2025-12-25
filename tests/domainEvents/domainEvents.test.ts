import { DomainEventDispatcher, DomainEventHandler } from '../../domainEvents';

interface UserCreatedEvent {
  type: 'UserCreated';
  userId: string;
  timestamp: Date;
}

describe('DomainEventDispatcher', () => {
  let dispatcher: DomainEventDispatcher;

  beforeEach(() => {
    dispatcher = new DomainEventDispatcher();
  });

  it('should register and dispatch handlers', async () => {
    const handler: DomainEventHandler<UserCreatedEvent> = {
      handle: jest.fn().mockResolvedValue(undefined)
    };

    dispatcher.register('UserCreated', handler);
    await dispatcher.dispatch({ type: 'UserCreated', userId: '1', timestamp: new Date() });

    expect(handler.handle).toHaveBeenCalled();
  });

  it('should dispatch to multiple handlers', async () => {
    const handler1 = { handle: jest.fn() };
    const handler2 = { handle: jest.fn() };

    dispatcher.register('UserCreated', handler1);
    dispatcher.register('UserCreated', handler2);
    await dispatcher.dispatch({ type: 'UserCreated', userId: '1', timestamp: new Date() });

    expect(handler1.handle).toHaveBeenCalled();
    expect(handler2.handle).toHaveBeenCalled();
  });

  it('should unregister handlers', async () => {
    const handler = { handle: jest.fn() };

    const unregister = dispatcher.register('UserCreated', handler);
    unregister();
    await dispatcher.dispatch({ type: 'UserCreated', userId: '1', timestamp: new Date() });

    expect(handler.handle).not.toHaveBeenCalled();
  });
});
