import { Ambassador, AmbassadorConfig, ProxyRule } from '../../ambassador';
describe('Ambassador', () => {
  let ambassador: Ambassador;
  beforeEach(() => { ambassador = new Ambassador(); });
  it('should add proxy rule', () => {
    ambassador.addRule({
      path: '/api/*',
      target: 'http://backend:3000',
      rewrite: { from: '/api/', to: '/' }
    });
    expect(ambassador.getRules().length).toBe(1);
  });
  it('should proxy request', async () => {
    ambassador.addRule({ path: '/service/*', target: 'http://service:8080' });
    const result = await ambassador.proxy({ path: '/service/health', method: 'GET' });
    expect(result).toBeDefined();
  });
  it('should apply rate limiting', () => {
    ambassador.addRule({
      path: '/limited/*',
      target: 'http://api:3000',
      rateLimit: { requests: 100, window: '1m' }
    });
    const rule = ambassador.getRule('/limited/*');
    expect(rule.rateLimit).toBeDefined();
  });
  it('should add authentication', () => {
    ambassador.addRule({
      path: '/secure/*',
      target: 'http://secure:443',
      auth: { type: 'jwt', header: 'Authorization' }
    });
    const rule = ambassador.getRule('/secure/*');
    expect(rule.auth.type).toBe('jwt');
  });
});