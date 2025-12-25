/**
 * @fileoverview Saga orchestration example
 */

import { SagaOrchestrator, StepBuilder } from '@sentinela/core/sagaOrchestration';

interface OrderContext {
  orderId: string;
  userId: string;
  items: { productId: string; quantity: number }[];
  status: string;
  paymentId?: string;
  shipmentId?: string;
}

const orchestrator = new SagaOrchestrator<OrderContext>();

// Define saga
orchestrator.register({
  name: 'CreateOrder',
  steps: [
    new StepBuilder<OrderContext>()
      .name('ReserveInventory')
      .execute(async (ctx) => {
        console.log('Reserving inventory for order:', ctx.orderId);
        return { ...ctx, status: 'inventory_reserved' };
      })
      .compensate(async (ctx) => {
        console.log('Releasing inventory for order:', ctx.orderId);
        return { ...ctx, status: 'inventory_released' };
      })
      .build(),
    new StepBuilder<OrderContext>()
      .name('ProcessPayment')
      .execute(async (ctx) => {
        console.log('Processing payment for order:', ctx.orderId);
        return { ...ctx, status: 'payment_processed', paymentId: 'pay_123' };
      })
      .compensate(async (ctx) => {
        console.log('Refunding payment:', ctx.paymentId);
        return { ...ctx, status: 'payment_refunded' };
      })
      .build(),
    new StepBuilder<OrderContext>()
      .name('CreateShipment')
      .execute(async (ctx) => {
        console.log('Creating shipment for order:', ctx.orderId);
        return { ...ctx, status: 'shipped', shipmentId: 'ship_456' };
      })
      .compensate(async (ctx) => {
        console.log('Cancelling shipment:', ctx.shipmentId);
        return { ...ctx, status: 'shipment_cancelled' };
      })
      .build()
  ]
});

// Execute saga
async function createOrder() {
  const saga = await orchestrator.start('CreateOrder', {
    orderId: 'order_789',
    userId: 'user_123',
    items: [{ productId: 'prod_1', quantity: 2 }],
    status: 'pending'
  });
  
  console.log('Saga completed:', saga.state, saga.context);
}

createOrder();
