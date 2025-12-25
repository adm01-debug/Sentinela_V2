/**
 * Event-driven architecture example
 */
import { DomainEventDispatcher } from '../src/domainEvents';
import { SagaOrchestrator } from '../src/sagaOrchestration';
const dispatcher = new DomainEventDispatcher();
const saga = new SagaOrchestrator<{ orderId: string; status: string }>();
dispatcher.register('OrderCreated', async (event) => {
  console.log('Order created:', event);
  await saga.start('ProcessOrder', { orderId: event.aggregateId!, status: 'pending' });
});
saga.register({
  name: 'ProcessOrder',
  steps: [
    { name: 'validate', execute: async (ctx) => ({ ...ctx, status: 'validated' }) },
    { name: 'payment', execute: async (ctx) => ({ ...ctx, status: 'paid' }) },
    { name: 'ship', execute: async (ctx) => ({ ...ctx, status: 'shipped' }) },
  ]
});
