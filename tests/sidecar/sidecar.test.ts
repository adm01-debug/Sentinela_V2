import { Ambassador } from '../../sidecar';
describe('Ambassador', () => {
  it('should proxy requests', async () => {
    const ambassador = new Ambassador({ targetHost: 'backend', targetPort: 8080 });
    const result = await ambassador.proxy({ method: 'GET', path: '/api' });
    expect(result).toHaveProperty('proxied', true);
  });
});
