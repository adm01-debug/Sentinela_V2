/**
 * @fileoverview CQRS Command and Query Bus implementation
 * @module @sentinela/core/cqrsAdvanced
 * @version 13.0.0
 */

export interface Command {
  type: string;
  [key: string]: unknown;
}

export interface Query {
  type: string;
  [key: string]: unknown;
}

export interface CommandHandler<TCommand extends Command = Command, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}

export interface QueryHandler<TQuery extends Query = Query, TResult = unknown> {
  execute(query: TQuery): Promise<TResult>;
}

export class CommandBus {
  private handlers = new Map<string, CommandHandler>();

  register<TCommand extends Command, TResult>(
    commandType: string,
    handler: CommandHandler<TCommand, TResult>
  ): void {
    this.handlers.set(commandType, handler as CommandHandler);
  }

  async execute<TResult = void>(command: Command): Promise<TResult> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error('No handler for command: ' + command.type);
    }
    return handler.execute(command) as Promise<TResult>;
  }
}

export class QueryBus {
  private handlers = new Map<string, QueryHandler>();

  register<TQuery extends Query, TResult>(
    queryType: string,
    handler: QueryHandler<TQuery, TResult>
  ): void {
    this.handlers.set(queryType, handler as QueryHandler);
  }

  async execute<TResult = unknown>(query: Query): Promise<TResult> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error('No handler for query: ' + query.type);
    }
    return handler.execute(query) as Promise<TResult>;
  }
}
