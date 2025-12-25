import { CommandBus, CommandHandler, Command } from '../../src/cqrsAdvanced';

describe('CommandBus', () => {
  let bus: CommandBus;

  beforeEach(() => {
    bus = new CommandBus();
  });

  it('should register and execute handler', async () => {
    const handler = jest.fn().mockResolvedValue({ success: true });
    bus.register('CreateUser', handler);
    
    const result = await bus.execute({ type: 'CreateUser', payload: { name: 'John' } });
    expect(handler).toHaveBeenCalled();
  });

  it('should throw if no handler registered', async () => {
    await expect(bus.execute({ type: 'Unknown', payload: {} }))
      .rejects.toThrow();
  });
});
