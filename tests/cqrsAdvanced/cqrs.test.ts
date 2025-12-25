import { CommandBus, CommandHandler, QueryBus, QueryHandler } from '../../cqrsAdvanced';

interface CreateUserCommand {
  type: 'CreateUser';
  name: string;
  email: string;
}

interface GetUserQuery {
  type: 'GetUser';
  id: string;
}

describe('CommandBus', () => {
  let bus: CommandBus;

  beforeEach(() => {
    bus = new CommandBus();
  });

  it('should register and execute command handler', async () => {
    const handler: CommandHandler<CreateUserCommand> = {
      execute: jest.fn().mockResolvedValue({ id: '123' })
    };

    bus.register('CreateUser', handler);
    const result = await bus.execute({ type: 'CreateUser', name: 'John', email: 'john@test.com' });

    expect(handler.execute).toHaveBeenCalled();
    expect(result).toEqual({ id: '123' });
  });

  it('should throw for unregistered command', async () => {
    await expect(
      bus.execute({ type: 'UnknownCommand' } as any)
    ).rejects.toThrow();
  });
});

describe('QueryBus', () => {
  let bus: QueryBus;

  beforeEach(() => {
    bus = new QueryBus();
  });

  it('should register and execute query handler', async () => {
    const handler: QueryHandler<GetUserQuery, { name: string }> = {
      execute: jest.fn().mockResolvedValue({ name: 'John' })
    };

    bus.register('GetUser', handler);
    const result = await bus.execute({ type: 'GetUser', id: '123' });

    expect(handler.execute).toHaveBeenCalled();
    expect(result).toEqual({ name: 'John' });
  });
});
