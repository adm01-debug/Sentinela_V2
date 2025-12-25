/**
 * @fileoverview Common decorators
 * @module @sentinela/core
 * @version 13.0.0
 */

import { createLogger } from './logger';
import { retry as retryFn } from './retry';
import { withTimeout } from './timeout';
import { Metrics } from './metrics';

const logger = createLogger('decorators');

/**
 * Log method execution
 */
export function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    logger.debug(`Calling ${propertyKey}`, { args });
    const result = await original.apply(this, args);
    logger.debug(`Completed ${propertyKey}`, { result });
    return result;
  };
  return descriptor;
}

/**
 * Measure method execution time
 */
export function Measure(metricName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    const name = metricName || propertyKey;
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        return await original.apply(this, args);
      } finally {
        const duration = Date.now() - start;
        logger.debug(`${name} took ${duration}ms`);
      }
    };
    return descriptor;
  };
}

/**
 * Validate method arguments
 */
export function Validate(schema: Record<string, (v: any) => boolean>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const argNames = Object.keys(schema);
      for (let i = 0; i < argNames.length; i++) {
        const name = argNames[i];
        const validator = schema[name];
        if (!validator(args[i])) {
          throw new Error(`Invalid argument: ${name}`);
        }
      }
      return original.apply(this, args);
    };
    return descriptor;
  };
}

/**
 * Deprecate method
 */
export function Deprecated(message?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      logger.warn(`DEPRECATED: ${propertyKey}. ${message || ''}`);
      return original.apply(this, args);
    };
    return descriptor;
  };
}

/**
 * Bind method to instance
 */
export function Bind(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  return {
    configurable: true,
    get() {
      const bound = descriptor.value.bind(this);
      Object.defineProperty(this, propertyKey, { value: bound, writable: true });
      return bound;
    }
  };
}
