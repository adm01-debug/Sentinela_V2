/**
 * CQRS Pattern Example
 * 
 * This example demonstrates:
 * - Command Bus
 * - Query Bus
 * - Event Store
 * - Saga Orchestration
 */

import {
  CommandBus,
  QueryBus,
  EventStore,
  SagaOrchestrator
} from '@sentinela/core';

// Types
interface CreateOrderCommand {
  type: 'CreateOrder';
  customerId: string;
  items: { productId: string; quantity: number }[];
}

interface GetOrderQuery {
  type: 'GetOrder';
  orderId: string;
}

interface Order {
  id: string;
  customerId: string;
  items: { productId: string; quantity: number }[];
  status: 'pending' | 'confirmed' | 'shipped';
}

// In-memory store
const orders = new Map<string, Order>();

// Command Handlers
const commandBus = new CommandBus();

commandBus.register('CreateOrder', {
  async execute(command: CreateOrderCommand) {
    const orderId = `order-${Date.now()}`;
    const order: Order = {
      id: orderId,
      customerId: command.customerId,
      items: command.items,
      status: 'pending'
    };
    orders.set(orderId, order);
    console.log('Order created:', orderId);
    return { orderId };
  }
});

// Query Handlers
const queryBus = new QueryBus();

queryBus.register('GetOrder', {
  async execute(query: GetOrderQuery) {
    const order = orders.get(query.orderId);
    if (!order) {
      throw new Error(`Order ${query.orderId} not found`);
    }
    return order;
  }
});

// Saga for order processing
const sagaOrchestrator = new SagaOrchestrator();

sagaOrchestrator.register({
  name: 'ProcessOrder',
  steps: [
    {
      name: 'ReserveInventory',
      execute: async (ctx) => {
        console.log('Reserving inventory for order:', ctx.orderId);
        return { ...ctx, inventoryReserved: true };
      },
      compensate: async (ctx) => {
        console.log('Releasing inventory for order:', ctx.orderId);
        return { ...ctx, inventoryReserved: false };
      }
    },
    {
      name: 'ProcessPayment',
      execute: async (ctx) => {
        console.log('Processing payment for order:', ctx.orderId);
        return { ...ctx, paymentProcessed: true };
      },
      compensate: async (ctx) => {
        console.log('Refunding payment for order:', ctx.orderId);
        return { ...ctx, paymentProcessed: false };
      }
    },
    {
      name: 'ConfirmOrder',
      execute: async (ctx) => {
        const order = orders.get(ctx.orderId);
        if (order) {
          order.status = 'confirmed';
          orders.set(ctx.orderId, order);
        }
        console.log('Order confirmed:', ctx.orderId);
        return { ...ctx, orderConfirmed: true };
      },
      compensate: async (ctx) => {
        const order = orders.get(ctx.orderId);
        if (order) {
          order.status = 'pending';
          orders.set(ctx.orderId, order);
        }
        return { ...ctx, orderConfirmed: false };
      }
    }
  ]
});

// Run example
async function main() {
  // Create order via command
  const result = await commandBus.execute<CreateOrderCommand, { orderId: string }>({
    type: 'CreateOrder',
    customerId: 'customer-1',
    items: [
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 }
    ]
  });

  console.log('Command result:', result);

  // Process order via saga
  const saga = await sagaOrchestrator.start('ProcessOrder', {
    orderId: result.orderId
  });

  console.log('Saga completed with state:', saga.state);

  // Query order
  const order = await queryBus.execute<GetOrderQuery, Order>({
    type: 'GetOrder',
    orderId: result.orderId
  });

  console.log('Order status:', order.status);
}

main();
