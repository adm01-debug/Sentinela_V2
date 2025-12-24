// Command Bus Implementation
import { Command, CommandHandler, CommandMetadata } from './types';
import { v4 as uuidv4 } from 'uuid';

export class CommandBus {
  private handlers: Map<string, CommandHandler> = new Map();
  private middlewares: CommandMiddleware[] = [];

  register<C extends Command>(handler: CommandHandler<C>): void {
    if (this.handlers.has(handler.commandType)) {
      throw new Error(\`Handler for \${handler.commandType} already registered\`);
    }
    this.handlers.set(handler.commandType, handler);
  }

  use(middleware: CommandMiddleware): void {
    this.middlewares.push(middleware);
  }

  async dispatch<C extends Command, R = void>(command: C): Promise<R> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(\`No handler registered for command: \${command.type}\`);
    }

    const context: CommandContext = {
      command,
      metadata: command.metadata,
      startTime: Date.now()
    };

    const executeHandler = async () => handler.handle(command) as Promise<R>;
    
    const chain = this.middlewares.reduceRight(
      (next, middleware) => () => middleware.execute(context, next),
      executeHandler
    );

    return chain();
  }

  static createCommand<T>(type: string, payload: T, options?: Partial<CommandMetadata>): Command<T> {
    return {
      type,
      payload,
      metadata: {
        commandId: options?.commandId ?? uuidv4(),
        correlationId: options?.correlationId ?? uuidv4(),
        causationId: options?.causationId,
        timestamp: options?.timestamp ?? new Date(),
        userId: options?.userId,
        tenantId: options?.tenantId
      }
    };
  }
}

export interface CommandContext {
  command: Command;
  metadata: CommandMetadata;
  startTime: number;
}

export interface CommandMiddleware {
  execute<R>(context: CommandContext, next: () => Promise<R>): Promise<R>;
}

export class LoggingMiddleware implements CommandMiddleware {
  async execute<R>(context: CommandContext, next: () => Promise<R>): Promise<R> {
    console.log(\`[COMMAND] Dispatching: \${context.command.type}\`, {
      commandId: context.metadata.commandId,
      correlationId: context.metadata.correlationId
    });
    
    try {
      const result = await next();
      console.log(\`[COMMAND] Completed: \${context.command.type} in \${Date.now() - context.startTime}ms\`);
      return result;
    } catch (error) {
      console.error(\`[COMMAND] Failed: \${context.command.type}\`, error);
      throw error;
    }
  }
}

export class ValidationMiddleware implements CommandMiddleware {
  private validators: Map<string, CommandValidator> = new Map();

  register(commandType: string, validator: CommandValidator): void {
    this.validators.set(commandType, validator);
  }

  async execute<R>(context: CommandContext, next: () => Promise<R>): Promise<R> {
    const validator = this.validators.get(context.command.type);
    if (validator) {
      const result = await validator.validate(context.command);
      if (!result.isValid) {
        throw new ValidationError(result.errors);
      }
    }
    return next();
  }
}

export interface CommandValidator {
  validate(command: Command): Promise<ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(\`Validation failed: \${errors.join(', ')}\`);
    this.name = 'ValidationError';
  }
}
