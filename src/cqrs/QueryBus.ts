type QueryHandler<T, R> = (query: T) => Promise<R>;
export class QueryBus {
  private handlers = new Map<string, QueryHandler<any, any>>();
  register<T, R>(queryName: string, handler: QueryHandler<T, R>) { this.handlers.set(queryName, handler); }
  async execute<T, R>(queryName: string, query: T): Promise<R> { const handler = this.handlers.get(queryName); if (!handler) throw new Error('Handler not found: ' + queryName); return handler(query); }
}
export const queryBus = new QueryBus();
