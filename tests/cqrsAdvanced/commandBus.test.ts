import { CommandBus, QueryBus } from '../../cqrsAdvanced';
describe('CommandBus', () => {
  let bus: CommandBus;
  beforeEach(() => { bus = new CommandBus(); });
  it('should execute commands', async () => {
    bus.register('CreateUser', { execute: async (cmd: any) => ({ id: '1', name: cmd.name }) });
    const result = await bus.execute({ type: 'CreateUser', name: 'Test' });
    expect(result).toEqual({ id: '1', name: 'Test' });
  });
  it('should throw for unknown command', async () => {
    await expect(bus.execute({ type: 'Unknown' })).rejects.toThrow();
  });
});
describe('QueryBus', () => {
  let bus: QueryBus;
  beforeEach(() => { bus = new QueryBus(); });
  it('should execute queries', async () => {
    bus.register('GetUser', { execute: async () => ({ id: '1' }) });
    const result = await bus.execute({ type: 'GetUser' });
    expect(result).toEqual({ id: '1' });
  });
});
