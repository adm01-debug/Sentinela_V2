import { SidecarProxy } from '../../src/serviceMeshAdvanced';

describe('SidecarProxy', () => {
  it('should configure virtual service', () => {
    const proxy = new SidecarProxy();
    
    proxy.configure({
      name: 'test-vs',
      hosts: ['service.local'],
      http: [{
        route: [{
          destination: { host: 'backend', port: { number: 80 } }
        }]
      }]
    });

    const route = proxy.route('service.local', '/api/users', {});
    expect(route).toBeDefined();
  });

  it('should handle weighted routing', () => {
    const proxy = new SidecarProxy();
    
    proxy.configure({
      name: 'canary',
      hosts: ['*'],
      http: [{
        route: [
          { destination: { host: 'v1' }, weight: 90 },
          { destination: { host: 'v2' }, weight: 10 }
        ]
      }]
    });

    // Run multiple times to test distribution
    const routes = Array.from({ length: 100 }, () => 
      proxy.route('*', '/', {})
    );
    
    expect(routes.filter(r => r?.host === 'v1').length).toBeGreaterThan(0);
  });
});
