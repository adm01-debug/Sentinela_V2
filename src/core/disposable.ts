/**
 * @fileoverview Disposable pattern utilities
 * @module @sentinela/core/disposable
 */

import { createLogger } from './logger';

const logger = createLogger('disposable');

/**
 * Interface for disposable resources
 */
export interface Disposable {
  dispose(): Promise<void> | void;
}

/**
 * Check if an object is disposable
 */
export function isDisposable(obj: unknown): obj is Disposable {
  return obj !== null && typeof obj === 'object' && 'dispose' in obj;
}

/**
 * Dispose multiple resources
 */
export async function disposeAll(...disposables: (Disposable | undefined)[]): Promise<void> {
  const errors: Error[] = [];
  
  for (const disposable of disposables) {
    if (!disposable) continue;
    
    try {
      await disposable.dispose();
    } catch (error) {
      errors.push(error as Error);
      logger.error('Error disposing resource', error as Error);
    }
  }
  
  if (errors.length > 0) {
    throw new AggregateError(errors, 'Failed to dispose some resources');
  }
}

/**
 * Disposable container that manages multiple disposables
 */
export class DisposableContainer implements Disposable {
  private readonly disposables: Disposable[] = [];
  private disposed = false;

  add<T extends Disposable>(disposable: T): T {
    if (this.disposed) {
      throw new Error('Container is already disposed');
    }
    this.disposables.push(disposable);
    return disposable;
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    
    await disposeAll(...this.disposables.reverse());
    this.disposables.length = 0;
  }
}

/**
 * Using pattern for automatic disposal
 */
export async function using<T extends Disposable, R>(
  resource: T | Promise<T>,
  fn: (resource: T) => Promise<R>
): Promise<R> {
  const resolvedResource = await resource;
  try {
    return await fn(resolvedResource);
  } finally {
    await resolvedResource.dispose();
  }
}

/**
 * Graceful shutdown handler
 */
export class GracefulShutdown {
  private readonly handlers: Array<() => Promise<void> | void> = [];
  private shuttingDown = false;

  register(handler: () => Promise<void> | void): void {
    this.handlers.push(handler);
  }

  registerDisposable(disposable: Disposable): void {
    this.handlers.push(() => disposable.dispose());
  }

  async shutdown(): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    
    logger.info('Starting graceful shutdown...');
    
    for (const handler of this.handlers.reverse()) {
      try {
        await handler();
      } catch (error) {
        logger.error('Error during shutdown', error as Error);
      }
    }
    
    logger.info('Graceful shutdown complete');
  }

  setupSignalHandlers(): void {
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
}

/** Global shutdown handler */
export const gracefulShutdown = new GracefulShutdown();
