import { APIGateway } from '../../apiGateway';
describe('APIGateway', () => {
  let gateway: APIGateway;
  beforeEach(() => { gateway = new APIGateway(); });
  it('should route requests', async () => {
    gateway.addRoute({ path: '/api', target: 'http://api:3000' });
    gateway.addRoute({ path: '/web', target: 'http://web:8080' });
    expect((await gateway.forward('/api/users'))?.target).toBe('http://api:3000');
    expect((await gateway.forward('/web/home'))?.target).toBe('http://web:8080');
  });
});
