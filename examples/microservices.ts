/**
 * Microservices patterns example
 */
import { ServiceDiscovery } from '../src/serviceDiscovery';
import { CircuitBreaker } from '../src/core/circuit-breaker';
import { APIGateway } from '../src/apiGateway';
const discovery = new ServiceDiscovery();
const gateway = new APIGateway();
const breakers = new Map<string, CircuitBreaker>();
async function setup() {
  await discovery.register({ name: 'users', host: 'localhost', port: 3001 });
  await discovery.register({ name: 'orders', host: 'localhost', port: 3002 });
  gateway.addRoute({ path: '/api/users', target: 'http://localhost:3001' });
  gateway.addRoute({ path: '/api/orders', target: 'http://localhost:3002' });
  breakers.set('users', new CircuitBreaker({ failureThreshold: 5 }));
  breakers.set('orders', new CircuitBreaker({ failureThreshold: 5 }));
}
