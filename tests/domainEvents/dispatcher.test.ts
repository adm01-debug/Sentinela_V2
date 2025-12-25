import { DomainEventDispatcher } from '../../domainEvents';
describe('DomainEventDispatcher', () => {
  let dispatcher: DomainEventDispatcher;
  beforeEach(() => { dispatcher = new DomainEventDispatcher(); });
  it('should dispatch events', async () => {
    const handler = jest.fn();
    dispatcher.register('TestEvent', handler);
    await dispatcher.dispatch({ type: 'TestEvent', occurredAt: new Date() });
    expect(handler).toHaveBeenCalled();
  });
  it('should unregister handler', async () => {
    const handler = jest.fn();
    const unregister = dispatcher.register('TestEvent', handler);
    unregister();
    await dispatcher.dispatch({ type: 'TestEvent', occurredAt: new Date() });
    expect(handler).not.toHaveBeenCalled();
  });
});
