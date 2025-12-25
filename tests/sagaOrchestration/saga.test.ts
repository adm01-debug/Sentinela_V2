import { SagaOrchestrator, StepBuilder } from '../../sagaOrchestration';

interface OrderContext {
  orderId: string;
  items: string[];
  status: string;
}

describe('SagaOrchestrator', () => {
  let orchestrator: SagaOrchestrator<OrderContext>;

  beforeEach(() => {
    orchestrator = new SagaOrchestrator();
  });

  it('should execute saga successfully', async () => {
    orchestrator.register({
      name: 'CreateOrder',
      steps: [
        {
          name: 'ReserveItems',
          execute: async (ctx) => ({ ...ctx, status: 'reserved' }),
          compensate: async (ctx) => ({ ...ctx, status: 'cancelled' })
        },
        {
          name: 'ProcessPayment',
          execute: async (ctx) => ({ ...ctx, status: 'paid' }),
          compensate: async (ctx) => ({ ...ctx, status: 'refunded' })
        }
      ]
    });

    const saga = await orchestrator.start('CreateOrder', {
      orderId: '123',
      items: ['item1'],
      status: 'pending'
    });

    expect(saga.state).toBe('completed');
    expect(saga.context.status).toBe('paid');
  });

  it('should compensate on failure', async () => {
    orchestrator.register({
      name: 'FailingSaga',
      steps: [
        {
          name: 'Step1',
          execute: async (ctx) => ({ ...ctx, step1: true }),
          compensate: async (ctx) => ({ ...ctx, step1: false })
        },
        {
          name: 'Step2',
          execute: async () => { throw new Error('Step 2 failed'); },
          compensate: async (ctx) => ctx
        }
      ]
    });

    const saga = await orchestrator.start('FailingSaga', { orderId: '123', items: [], status: 'pending' });

    expect(saga.state).toBe('compensated');
  });
});

describe('StepBuilder', () => {
  it('should build step definition', () => {
    const step = new StepBuilder<OrderContext>()
      .name('TestStep')
      .execute(async (ctx) => ctx)
      .compensate(async (ctx) => ctx)
      .retries(3)
      .timeout(5000)
      .build();

    expect(step.name).toBe('TestStep');
    expect(step.retries).toBe(3);
    expect(step.timeout).toBe(5000);
  });
});
