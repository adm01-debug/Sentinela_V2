// Command Bus - CQRS Advanced
export interface Command {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly metadata: CommandMetadata;
}

export interface CommandMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  timestamp: Date;
}

export interface CommandHandler<T extends Command = Command> {
  readonly commandType: string;
  handle(command: T): Promise<void>;
}

export interface CommandMiddleware {
  execute(command: Command, next: () => Promise<void>): Promise<void>;
}

export class CommandBus {
  private handlers: Map<string, CommandHandler> = new Map();
  private middlewares: CommandMiddleware[] = [];

  register<T extends Command>(handler: CommandHandler<T>): void {
    this.handlers.set(handler.commandType, handler);
  }

  use(middleware: CommandMiddleware): void {
    this.middlewares.push(middleware);
  }

  async dispatch(command: Command): Promise<void> {
    const handler = this.handlers.get(command.type);
    if (!handler) throw new Error(`No handler for command: ${command.type}`);

    const execute = async () => handler.handle(command);
    const chain = this.middlewares.reduceRight(
      (next, middleware) => () => middleware.execute(command, next),
      execute
    );
    await chain();
  }
}

export class LoggingMiddleware implements CommandMiddleware {
  async execute(command: Command, next: () => Promise<void>): Promise<void> {
    console.log(`[CMD] Executing: ${command.type}`, command.metadata.correlationId);
    const start = Date.now();
    try {
      await next();
      console.log(`[CMD] Completed: ${command.type} in ${Date.now() - start}ms`);
    } catch (error) {
      console.error(`[CMD] Failed: ${command.type}`, error);
      throw error;
    }
  }
}

export class ValidationMiddleware implements CommandMiddleware {
  async execute(command: Command, next: () => Promise<void>): Promise<void> {
    if (!command.type) throw new Error("Command type is required");
    if (!command.metadata?.correlationId) throw new Error("Correlation ID is required");
    await next();
  }
}
