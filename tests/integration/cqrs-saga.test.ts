/**
 * Integration tests for CQRS + Saga
 */
import { CommandBus, QueryBus } from '../../cqrsAdvanced';
import { SagaOrchestrator } from '../../sagaOrchestration';

describe('CQRS + Saga Integration', () => {
  it('should process order with saga', async () => {
    const commandBus = new CommandBus();
    const saga = new SagaOrchestrator();
    
    commandBus.register('CreateOrder', {
      async execute(cmd: any) {
        await saga.start('OrderSaga', { orderId: cmd.orderId });
        return { success: true };
      }
    });

    const result = await commandBus.execute({ type: 'CreateOrder', orderId: '123' });
    expect(result.success).toBe(true);
  });
});
