import { IngressController, Ingress, IngressRule } from '../../ingressController';
describe('IngressController', () => {
  let controller: IngressController;
  beforeEach(() => { controller = new IngressController(); });
  it('should create ingress', async () => {
    const ingress = await controller.create({
      name: 'app-ingress',
      rules: [{ host: 'app.example.com', http: { paths: [{ path: '/', backend: { serviceName: 'app', servicePort: 80 } }] } }]
    });
    expect(ingress.rules[0].host).toBe('app.example.com');
  });
  it('should configure TLS', async () => {
    const ingress = await controller.create({
      name: 'tls-ingress',
      tls: [{ hosts: ['secure.example.com'], secretName: 'tls-secret' }],
      rules: [{ host: 'secure.example.com', http: { paths: [{ path: '/', backend: { serviceName: 'app', servicePort: 443 } }] } }]
    });
    expect(ingress.tls[0].secretName).toBe('tls-secret');
  });
  it('should add annotations', async () => {
    const ingress = await controller.create({
      name: 'annotated',
      annotations: { 'nginx.ingress.kubernetes.io/rewrite-target': '/' }
    });
    expect(ingress.annotations).toBeDefined();
  });
});