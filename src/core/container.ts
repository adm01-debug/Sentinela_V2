/**
 * @fileoverview Simple Dependency Injection Container
 * @module @sentinela/core
 * @version 13.0.0
 */

type Constructor<T = any> = new (...args: any[]) => T;
type Factory<T = any> = () => T;

interface Binding<T> {
  type: 'singleton' | 'transient';
  factory: Factory<T>;
  instance?: T;
}

export class Container {
  private bindings = new Map<string | symbol, Binding<any>>();

  /**
   * Register a singleton binding
   */
  singleton<T>(token: string | symbol, factory: Factory<T>): this {
    this.bindings.set(token, { type: 'singleton', factory });
    return this;
  }

  /**
   * Register a transient binding
   */
  transient<T>(token: string | symbol, factory: Factory<T>): this {
    this.bindings.set(token, { type: 'transient', factory });
    return this;
  }

  /**
   * Register a class as singleton
   */
  bind<T>(token: string | symbol, cls: Constructor<T>): this {
    return this.singleton(token, () => new cls());
  }

  /**
   * Resolve a dependency
   */
  resolve<T>(token: string | symbol): T {
    const binding = this.bindings.get(token);
    if (!binding) {
      throw new Error(`No binding found for: ${String(token)}`);
    }
    if (binding.type === 'singleton') {
      if (!binding.instance) {
        binding.instance = binding.factory();
      }
      return binding.instance;
    }
    return binding.factory();
  }

  /**
   * Check if binding exists
   */
  has(token: string | symbol): boolean {
    return this.bindings.has(token);
  }

  /**
   * Clear all bindings
   */
  clear(): void {
    this.bindings.clear();
  }
}

// Global container instance
export const container = new Container();

/**
 * Inject decorator
 */
export function Inject(token: string | symbol) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get: () => container.resolve(token),
      enumerable: true,
      configurable: true
    });
  };
}
