// Query Bus - CQRS Advanced
export interface Query {
  readonly type: string;
  readonly params: Record<string, unknown>;
}

export interface QueryResult<T = unknown> {
  data: T;
  metadata: QueryResultMetadata;
}

export interface QueryResultMetadata {
  executionTime: number;
  cached: boolean;
  source: string;
}

export interface QueryHandler<Q extends Query = Query, R = unknown> {
  readonly queryType: string;
  handle(query: Q): Promise<QueryResult<R>>;
}

export interface QueryMiddleware {
  execute<R>(query: Query, next: () => Promise<QueryResult<R>>): Promise<QueryResult<R>>;
}

export class QueryBus {
  private handlers: Map<string, QueryHandler> = new Map();
  private middlewares: QueryMiddleware[] = [];

  register<Q extends Query, R>(handler: QueryHandler<Q, R>): void {
    this.handlers.set(handler.queryType, handler as QueryHandler);
  }

  use(middleware: QueryMiddleware): void {
    this.middlewares.push(middleware);
  }

  async execute<R>(query: Query): Promise<QueryResult<R>> {
    const handler = this.handlers.get(query.type);
    if (!handler) throw new Error(`No handler for query: ${query.type}`);

    const execute = async () => handler.handle(query) as Promise<QueryResult<R>>;
    const chain = this.middlewares.reduceRight(
      (next, middleware) => () => middleware.execute<R>(query, next),
      execute
    );
    return chain();
  }
}

export class CachingMiddleware implements QueryMiddleware {
  private cache: Map<string, { result: QueryResult; expiry: number }> = new Map();
  private ttl: number;

  constructor(ttlMs: number = 60000) {
    this.ttl = ttlMs;
  }

  async execute<R>(query: Query, next: () => Promise<QueryResult<R>>): Promise<QueryResult<R>> {
    const key = JSON.stringify({ type: query.type, params: query.params });
    const cached = this.cache.get(key);

    if (cached && cached.expiry > Date.now()) {
      return { ...cached.result, metadata: { ...cached.result.metadata, cached: true } } as QueryResult<R>;
    }

    const result = await next();
    this.cache.set(key, { result, expiry: Date.now() + this.ttl });
    return result;
  }
}
