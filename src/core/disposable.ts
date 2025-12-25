/**
 * @packageDocumentation
 * @module Core/Disposable
 * Resource cleanup and graceful shutdown utilities
 */
import { Logger, logger as defaultLogger } from './logger';

/** Interface for disposable resources */
export interface Disposable {
  dispose(): Promise<void>;
}

/** Interface for initializable resources */
export interface Initializable {
  initialize(): Promise<void>;
}

/** Combined interface for managed resources */
export interface ManagedResource extends Disposable, Initializable {
  readonly isInitialized: boolean;
  readonly isDisposed: boolean;
}

/**
 * Manages multiple disposable resources with ordered shutdown
 */
export class DisposableManager {
  private resources: { name: string; resource: Disposable; priority: number }[] = [];
  private disposed = false;
  private readonly logger: Logger;

  constructor(logger: Logger = defaultLogger) {
    this.logger = logger.child({ component: 'DisposableManager' });
  }

  register(name: string, resource: Disposable, priority = 0): void {
    if (this.disposed) {
      throw new Error('Manager is already disposed');
    }
    this.resources.push({ name, resource, priority });
    this.logger.debug('Registered disposable resource', { name, priority });
  }

  async disposeAll(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;

    const sorted = [...this.resources].sort((a, b) => b.priority - a.priority);
    this.logger.info('Starting graceful shutdown', { count: sorted.length });

    for (const { name, resource } of sorted) {
      try {
        this.logger.debug('Disposing resource', { name });
        await resource.dispose();
        this.logger.debug('Resource disposed', { name });
      } catch (error) {
        this.logger.error('Failed to dispose resource', error as Error, { name });
      }
    }

    this.logger.info('Graceful shutdown complete');
  }

  isDisposed(): boolean { return this.disposed; }
}

/**
 * Abstract base class for managed resources
 */
export abstract class BaseManagedResource implements ManagedResource {
  private _isInitialized = false;
  private _isDisposed = false;

  get isInitialized(): boolean { return this._isInitialized; }
  get isDisposed(): boolean { return this._isDisposed; }

  async initialize(): Promise<void> {
    if (this._isInitialized) return;
    if (this._isDisposed) throw new Error('Resource is disposed');
    await this.doInitialize();
    this._isInitialized = true;
  }

  async dispose(): Promise<void> {
    if (this._isDisposed) return;
    await this.doDispose();
    this._isDisposed = true;
    this._isInitialized = false;
  }

  protected abstract doInitialize(): Promise<void>;
  protected abstract doDispose(): Promise<void>;
}

/** Global disposable manager for application shutdown */
export const globalDisposableManager = new DisposableManager();

/** Register shutdown handlers */
export function registerShutdownHandlers(): void {
  const shutdown = async (signal: string) => {
    defaultLogger.info('Received shutdown signal', { signal });
    await globalDisposableManager.disposeAll();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));
}
