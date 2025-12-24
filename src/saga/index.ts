// Saga Pattern - Main Export
export * from "./sagaOrchestrator";
export * from "./sagaBuilder";
export * from "./sagaRepository";
export * from "./sagaEvents";

import { createSaga, SagaBuilder } from "./sagaBuilder";
import { SagaOrchestrator } from "./sagaOrchestrator";
import { InMemorySagaRepository, SagaRecoveryService } from "./sagaRepository";
import { SagaEventEmitter, SagaLogger } from "./sagaEvents";

// Example: Order Processing Saga
interface OrderContext {
  orderId: string;
  customerId: string;
  amount: number;
  inventoryReserved?: boolean;
  paymentProcessed?: boolean;
  shippingScheduled?: boolean;
}

export const createOrderProcessingSaga = () => {
  return createSaga<OrderContext>()
    .withName("OrderProcessing")
    .addStep(
      "ReserveInventory",
      async (ctx) => { ctx.inventoryReserved = true; console.log(`Reserved inventory for ${ctx.orderId}`); },
      async (ctx) => { ctx.inventoryReserved = false; console.log(`Released inventory for ${ctx.orderId}`); }
    )
    .addStep(
      "ProcessPayment",
      async (ctx) => { ctx.paymentProcessed = true; console.log(`Payment processed for ${ctx.orderId}: $${ctx.amount}`); },
      async (ctx) => { ctx.paymentProcessed = false; console.log(`Payment refunded for ${ctx.orderId}`); }
    )
    .addStep(
      "ScheduleShipping",
      async (ctx) => { ctx.shippingScheduled = true; console.log(`Shipping scheduled for ${ctx.orderId}`); },
      async (ctx) => { ctx.shippingScheduled = false; console.log(`Shipping cancelled for ${ctx.orderId}`); }
    )
    .buildOrchestrator();
};

export { createSaga };
