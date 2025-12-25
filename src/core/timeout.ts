/**
 * @fileoverview Timeout utilities
 * @module @sentinela/core/timeout
 */

import { TimeoutError } from './errors';

/**
 * Execute a function with a timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  operation: string = 'operation'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(operation, timeoutMs));
      }, timeoutMs);
    })
  ]);
}

/**
 * Create a timeout promise
 */
export function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError('timeout', ms)), ms);
  });
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limitMs) {
      lastRun = now;
      fn(...args);
    }
  };
}

/**
 * Create a deadline that resolves at a specific time
 */
export function deadline(date: Date): Promise<never> {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) {
    return Promise.reject(new TimeoutError('deadline', 0));
  }
  return timeout(ms);
}

/**
 * Decorator for timeout
 */
export function Timeout(ms: number) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;
    
    descriptor.value = async function (...args: unknown[]) {
      return withTimeout(() => originalMethod.apply(this, args), ms, propertyKey);
    } as T;
    
    return descriptor;
  };
}
