import { IngressController } from '../../ingressController';
describe('IngressController', () => {
  it('should create ingress', async () => {
    const controller = new IngressController();
    const ingress = await controller.create({ name: 'api-ingress', host: 'api.example.com' });
    expect(ingress.host).toBe('api.example.com');
  });
});
