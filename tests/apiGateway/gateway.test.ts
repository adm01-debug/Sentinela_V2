import { APIGateway } from '../../apiGateway';

describe('APIGateway', () => {
  let gateway: APIGateway;
  beforeEach(() => { gateway = new APIGateway({ routes: [] }); });

  it('should register routes', () => {
    gateway.route('/api/users', { target: 'http://user-service:3000' });
    expect(gateway.hasRoute('/api/users')).toBe(true);
  });

  it('should apply rate limiting', async () => {
    gateway.route('/api/limited', { target: 'http://service:3000', rateLimit: 10 });
    for (let i = 0; i < 15; i++) {
      try { await gateway.handle({ path: '/api/limited', method: 'GET' }); } catch {}
    }
    const metrics = gateway.getMetrics();
    expect(metrics.rateLimited).toBeGreaterThan(0);
  });
});
