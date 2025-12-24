// Query Bus Implementation
import { Query, QueryHandler, QueryMetadata } from './types';
import { v4 as uuidv4 } from 'uuid';

export class QueryBus {
  private handlers: Map<string, QueryHandler> = new Map();
  private middlewares: QueryMiddleware[] = [];
  private cache: QueryCache | null = null;

  register<Q extends Query, R>(handler: QueryHandler<Q, R>): void {
    if (this.handlers.has(handler.queryType)) {
      throw new Error(\`Handler for \${handler.queryType} already registered\`);
    }
    this.handlers.set(handler.queryType, handler);
  }

  use(middleware: QueryMiddleware): void {
    this.middlewares.push(middleware);
  }

  setCache(cache: QueryCache): void {
    this.cache = cache;
  }

  async execute<Q extends Query, R>(query: Q): Promise<R> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(\`No handler registered for query: \${query.type}\`);
    }

    const context: QueryContext = {
      query,
      metadata: query.metadata,
      startTime: Date.now()
    };

    // Check cache first
    if (this.cache) {
      const cacheKey = this.cache.generateKey(query);
      const cached = await this.cache.get<R>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const executeHandler = async () => {
      const result = await handler.handle(query) as R;
      
      // Store in cache
      if (this.cache) {
        const cacheKey = this.cache.generateKey(query);
        await this.cache.set(cacheKey, result);
      }
      
      return result;
    };

    const chain = this.middlewares.reduceRight(
      (next, middleware) => () => middleware.execute(context, next),
      executeHandler
    );

    return chain();
  }

  static createQuery<T>(type: string, payload: T, options?: Partial<QueryMetadata>): Query<T> {
    return {
      type,
      payload,
      metadata: {
        queryId: options?.queryId ?? uuidv4(),
        correlationId: options?.correlationId ?? uuidv4(),
        timestamp: options?.timestamp ?? new Date(),
        userId: options?.userId,
        tenantId: options?.tenantId
      }
    };
  }
}

export interface QueryContext {
  query: Query;
  metadata: QueryMetadata;
  startTime: number;
}

export interface QueryMiddleware {
  execute<R>(context: QueryContext, next: () => Promise<R>): Promise<R>;
}

export interface QueryCache {
  generateKey(query: Query): string;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
}

export class InMemoryQueryCache implements QueryCache {
  private cache: Map<string, { value: unknown; expires: number }> = new Map();
  private defaultTtl: number;

  constructor(defaultTtlMs: number = 60000) {
    this.defaultTtl = defaultTtlMs;
  }

  generateKey(query: Query): string {
    return \`\${query.type}:\${JSON.stringify(query.payload)}\`;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl ?? this.defaultTtl)
    });
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export class QueryLoggingMiddleware implements QueryMiddleware {
  async execute<R>(context: QueryContext, next: () => Promise<R>): Promise<R> {
    console.log(\`[QUERY] Executing: \${context.query.type}\`, {
      queryId: context.metadata.queryId,
      correlationId: context.metadata.correlationId
    });
    
    try {
      const result = await next();
      console.log(\`[QUERY] Completed: \${context.query.type} in \${Date.now() - context.startTime}ms\`);
      return result;
    } catch (error) {
      console.error(\`[QUERY] Failed: \${context.query.type}\`, error);
      throw error;
    }
  }
}
