import { SagaOrchestrator, SagaDefinition, StepDefinition } from '../../src/sagaOrchestration';

describe('SagaOrchestrator', () => {
  let orchestrator: SagaOrchestrator<{ orderId: string; amount: number }>;

  beforeEach(() => {
    orchestrator = new SagaOrchestrator();
  });

  it('should execute saga steps in order', async () => {
    const steps: string[] = [];
    
    orchestrator.register({
      name: 'createOrder',
      steps: [
        {
          name: 'reserveInventory',
          execute: async (ctx) => { steps.push('reserve'); return ctx; },
          compensate: async (ctx) => { steps.push('unreserve'); return ctx; }
        },
        {
          name: 'processPayment',
          execute: async (ctx) => { steps.push('pay'); return ctx; },
          compensate: async (ctx) => { steps.push('refund'); return ctx; }
        }
      ]
    });

    await orchestrator.start('createOrder', { orderId: '123', amount: 100 });
    expect(steps).toEqual(['reserve', 'pay']);
  });

  it('should compensate on failure', async () => {
    const steps: string[] = [];
    
    orchestrator.register({
      name: 'failingSaga',
      steps: [
        {
          name: 'step1',
          execute: async (ctx) => { steps.push('exec1'); return ctx; },
          compensate: async (ctx) => { steps.push('comp1'); return ctx; }
        },
        {
          name: 'step2',
          execute: async () => { throw new Error('Failed'); },
          compensate: async (ctx) => { steps.push('comp2'); return ctx; }
        }
      ]
    });

    const saga = await orchestrator.start('failingSaga', { orderId: '123', amount: 100 });
    expect(saga.state).toBe('compensated');
    expect(steps).toContain('comp1');
  });
});
