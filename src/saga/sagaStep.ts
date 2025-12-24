// Saga Step Builder
import { SagaStepDefinition } from './types';

export class SagaStepBuilder<C> {
  private name: string = '';
  private executeFn?: (context: C) => Promise<unknown>;
  private compensateFn?: (context: C, result: unknown) => Promise<void>;
  private retryable: boolean = true;
  private timeout: number = 30000;

  static create<C>(): SagaStepBuilder<C> {
    return new SagaStepBuilder<C>();
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withExecute(fn: (context: C) => Promise<unknown>): this {
    this.executeFn = fn;
    return this;
  }

  withCompensate(fn: (context: C, result: unknown) => Promise<void>): this {
    this.compensateFn = fn;
    return this;
  }

  withRetryable(retryable: boolean): this {
    this.retryable = retryable;
    return this;
  }

  withTimeout(timeout: number): this {
    this.timeout = timeout;
    return this;
  }

  build(): SagaStepDefinition<C> {
    if (!this.name || !this.executeFn || !this.compensateFn) {
      throw new Error('Missing required step properties');
    }

    return {
      name: this.name,
      execute: this.executeFn,
      compensate: this.compensateFn,
      retryable: this.retryable,
      timeout: this.timeout
    };
  }
}

// Pre-built common steps
export const CommonSteps = {
  createReservation: <C extends { productId: string; quantity: number }>(
    reservationService: ReservationService
  ): SagaStepDefinition<C> => ({
    name: 'CreateReservation',
    execute: async (ctx) => reservationService.reserve(ctx.productId, ctx.quantity),
    compensate: async (ctx, result) => reservationService.cancel(result as string),
    retryable: true,
    timeout: 10000
  }),

  processPayment: <C extends { amount: number; paymentMethod: string }>(
    paymentService: PaymentService
  ): SagaStepDefinition<C> => ({
    name: 'ProcessPayment',
    execute: async (ctx) => paymentService.charge(ctx.amount, ctx.paymentMethod),
    compensate: async (ctx, result) => paymentService.refund(result as string),
    retryable: false,
    timeout: 60000
  }),

  sendNotification: <C extends { userId: string; message: string }>(
    notificationService: NotificationService
  ): SagaStepDefinition<C> => ({
    name: 'SendNotification',
    execute: async (ctx) => notificationService.send(ctx.userId, ctx.message),
    compensate: async () => Promise.resolve(),
    retryable: true,
    timeout: 5000
  })
};

export interface ReservationService {
  reserve(productId: string, quantity: number): Promise<string>;
  cancel(reservationId: string): Promise<void>;
}

export interface PaymentService {
  charge(amount: number, method: string): Promise<string>;
  refund(transactionId: string): Promise<void>;
}

export interface NotificationService {
  send(userId: string, message: string): Promise<string>;
}
