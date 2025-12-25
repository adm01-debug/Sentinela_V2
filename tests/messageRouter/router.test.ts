import { MessageRouter, Route, RoutingKey } from '../../messageRouter';

describe('MessageRouter', () => {
  let router: MessageRouter;

  beforeEach(() => {
    router = new MessageRouter();
  });

  it('should route by type', async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    router.addRoute({
      pattern: { type: 'order.*' },
      handler: handler1
    });

    router.addRoute({
      pattern: { type: 'user.*' },
      handler: handler2
    });

    await router.route({ type: 'order.created', data: {} });
    await router.route({ type: 'user.registered', data: {} });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should route to multiple handlers', async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    router.addRoute({ pattern: { type: 'event.*' }, handler: handler1 });
    router.addRoute({ pattern: { type: 'event.*' }, handler: handler2 });

    await router.route({ type: 'event.test', data: {} });

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('should use default route for unmatched messages', async () => {
    const defaultHandler = jest.fn();
    router.setDefaultRoute(defaultHandler);

    await router.route({ type: 'unknown.message', data: {} });

    expect(defaultHandler).toHaveBeenCalled();
  });

  it('should route by header', async () => {
    const handler = jest.fn();

    router.addRoute({
      pattern: { headers: { priority: 'high' } },
      handler
    });

    await router.route({
      type: 'any.type',
      headers: { priority: 'high' },
      data: {}
    });

    expect(handler).toHaveBeenCalled();
  });
});
