import { SagaOrchestrator, StepBuilder } from '../../sagaOrchestration';
describe('SagaOrchestrator', () => {
  it('should execute saga steps', async () => {
    const saga = new SagaOrchestrator<{ value: number }>();
    saga.register({
      name: 'TestSaga',
      steps: [
        { name: 'step1', execute: async (ctx) => ({ ...ctx, value: ctx.value + 1 }) },
        { name: 'step2', execute: async (ctx) => ({ ...ctx, value: ctx.value * 2 }) }
      ]
    });
    const result = await saga.start('TestSaga', { value: 5 });
    expect(result.context.value).toBe(12);
    expect(result.state).toBe('completed');
  });
});
