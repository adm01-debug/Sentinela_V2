/**
 * @fileoverview Saga Orchestration example
 */

import { SagaOrchestrator } from '@sentinela/core/sagaOrchestration';
import { createLogger } from '@sentinela/core';

const logger = createLogger('saga-example');

// Context for order processing saga
interface OrderContext {
  orderId: string;
  customerId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  paymentId?: string;
  shipmentId?: string;
  status: string;
  error?: string;
}

// Create orchestrator
const orchestrator = new SagaOrchestrator<OrderContext>();

// Register order processing saga
orchestrator.register({
  name: 'ProcessOrder',
  steps: [
    {
      name: 'ReserveInventory',
      async execute(ctx) {
        logger.info('Reserving inventory', { orderId: ctx.orderId });
        // Simulate inventory reservation
        return { ...ctx, status: 'inventory_reserved' };
      },
      async compensate(ctx) {
        logger.info('Releasing inventory', { orderId: ctx.orderId });
        return { ...ctx, status: 'inventory_released' };
      }
    },
    {
      name: 'ProcessPayment',
      async execute(ctx) {
        logger.info('Processing payment', { amount: ctx.totalAmount });
        // Simulate payment
        const paymentId = `PAY-${Date.now()}`;
        return { ...ctx, paymentId, status: 'payment_processed' };
      },
      async compensate(ctx) {
        logger.info('Refunding payment', { paymentId: ctx.paymentId });
        return { ...ctx, status: 'payment_refunded' };
      }
    },
    {
      name: 'CreateShipment',
      async execute(ctx) {
        logger.info('Creating shipment', { orderId: ctx.orderId });
        const shipmentId = `SHIP-${Date.now()}`;
        return { ...ctx, shipmentId, status: 'shipment_created' };
      },
      async compensate(ctx) {
        logger.info('Cancelling shipment', { shipmentId: ctx.shipmentId });
        return { ...ctx, status: 'shipment_cancelled' };
      }
    },
    {
      name: 'SendConfirmation',
      async execute(ctx) {
        logger.info('Sending confirmation email', { customerId: ctx.customerId });
        return { ...ctx, status: 'completed' };
      },
      async compensate(ctx) {
        logger.info('Sending cancellation email', { customerId: ctx.customerId });
        return { ...ctx, status: 'cancelled' };
      }
    }
  ]
});

// Usage
async function main() {
  const saga = await orchestrator.start('ProcessOrder', {
    orderId: 'ORD-001',
    customerId: 'CUST-123',
    items: [
      { productId: 'PROD-1', quantity: 2, price: 29.99 }
    ],
    totalAmount: 59.98,
    status: 'pending'
  });

  console.log('Saga completed:', saga.state);
  console.log('Final context:', saga.context);
}

main();
