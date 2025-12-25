import { APIGateway, Route, RateLimiter, AuthMiddleware } from '../../apiGateway';

describe('APIGateway', () => {
  let gateway: APIGateway;

  beforeEach(() => {
    gateway = new APIGateway({
      port: 3000,
      basePath: '/api/v1'
    });
  });

  it('should register routes', () => {
    gateway.registerRoute({
      path: '/users',
      method: 'GET',
      handler: async () => ({ users: [] }),
      middleware: []
    });

    const routes = gateway.getRoutes();
    expect(routes.length).toBe(1);
    expect(routes[0].path).toBe('/users');
  });

  it('should add middleware', () => {
    const authMiddleware = { execute: jest.fn() };
    gateway.use(authMiddleware);

    expect(gateway.getMiddleware().length).toBe(1);
  });

  it('should route requests', async () => {
    const handler = jest.fn().mockResolvedValue({ data: 'test' });
    
    gateway.registerRoute({
      path: '/test',
      method: 'GET',
      handler,
      middleware: []
    });

    const response = await gateway.handleRequest({
      path: '/api/v1/test',
      method: 'GET',
      headers: {},
      body: null
    });

    expect(handler).toHaveBeenCalled();
    expect(response.data).toBe('test');
  });
});

describe('APIGateway RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 10,
      windowMs: 1000
    });
  });

  it('should allow requests within limit', async () => {
    for (let i = 0; i < 10; i++) {
      const result = await rateLimiter.check('client-1');
      expect(result.allowed).toBe(true);
    }
  });

  it('should block requests over limit', async () => {
    for (let i = 0; i < 10; i++) {
      await rateLimiter.check('client-2');
    }

    const result = await rateLimiter.check('client-2');
    expect(result.allowed).toBe(false);
  });
});
