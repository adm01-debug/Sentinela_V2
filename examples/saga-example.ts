/**
 * Saga pattern example
 */
import { SagaOrchestrator } from '../src/sagaOrchestration';
interface OrderContext { orderId: string; items: string[]; total: number; paymentId?: string; }
const saga = new SagaOrchestrator<OrderContext>();
saga.register({
  name: 'OrderSaga',
  steps: [
    { name: 'reserve', execute: async (ctx) => ({ ...ctx, reserved: true }), compensate: async (ctx) => ({ ...ctx, reserved: false }) },
    { name: 'payment', execute: async (ctx) => ({ ...ctx, paymentId: 'pay_' + Date.now() }), compensate: async (ctx) => ({ ...ctx, paymentId: undefined }) },
    { name: 'ship', execute: async (ctx) => ({ ...ctx, shipped: true }) },
  ]
});
