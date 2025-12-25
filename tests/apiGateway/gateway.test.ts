import { Gateway, RateLimiter, RequestTransformer } from '../../src/apiGateway';

describe('Gateway', () => {
  let gateway: Gateway;

  beforeEach(() => {
    gateway = new Gateway();
    gateway.configure({
      name: 'test-gateway',
      routes: [
        {
          path: '/api/users',
          methods: ['GET', 'POST'],
          upstream: { service: 'user-service', port: 8080 }
        },
        {
          path: '/api/orders',
          methods: ['GET'],
          upstream: { service: 'order-service', port: 8081 }
        }
      ],
      plugins: []
    });
  });

  it('should route to correct upstream', async () => {
    const response = await gateway.handle({
      method: 'GET',
      path: '/api/users',
      headers: {}
    });

    expect(response.status).toBe(200);
  });

  it('should return 404 for unknown path', async () => {
    const response = await gateway.handle({
      method: 'GET',
      path: '/unknown',
      headers: {}
    });

    expect(response.status).toBe(404);
  });
});

describe('RateLimiter', () => {
  it('should allow requests within limit', async () => {
    const limiter = new RateLimiter(10, 60);
    
    const req = { method: 'GET', path: '/', headers: { 'x-api-key': 'test' } };
    
    // Should not throw for first requests
    await expect(limiter.preRequest(req)).resolves.toBeDefined();
  });

  it('should block requests over limit', async () => {
    const limiter = new RateLimiter(2, 60);
    
    const req = { method: 'GET', path: '/', headers: { 'x-api-key': 'test' } };
    
    await limiter.preRequest(req);
    await limiter.preRequest(req);
    
    await expect(limiter.preRequest(req)).rejects.toThrow('Rate limit exceeded');
  });
});

describe('RequestTransformer', () => {
  it('should add headers', async () => {
    const transformer = new RequestTransformer([
      { addHeader: { name: 'X-Custom', value: 'test' } }
    ]);

    const req = { method: 'GET', path: '/', headers: {} };
    const transformed = await transformer.preRequest(req);
    
    expect(transformed.headers['X-Custom']).toBe('test');
  });

  it('should rewrite path', async () => {
    const transformer = new RequestTransformer([
      { rewritePath: { from: '^/api', to: '/v2' } }
    ]);

    const req = { method: 'GET', path: '/api/users', headers: {} };
    const transformed = await transformer.preRequest(req);
    
    expect(transformed.path).toBe('/v2/users');
  });
});
