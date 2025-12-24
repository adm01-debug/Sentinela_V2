import { ExchangeOptions } from './types';

export class ExchangeManager {
  private exchanges: Map<string, ExchangeConfig> = new Map();
  
  define(name: string, type: ExchangeOptions['type'], options?: Partial<ExchangeOptions>): void {
    this.exchanges.set(name, { name, type, options: options ?? {} });
  }
  
  getExchange(name: string): ExchangeConfig | undefined { return this.exchanges.get(name); }
  getAll(): ExchangeConfig[] { return Array.from(this.exchanges.values()); }
}

export interface ExchangeConfig { name: string; type: ExchangeOptions['type']; options: Partial<ExchangeOptions>; }

export class TopicExchange {
  constructor(private name: string) {}
  
  matchRoutingKey(pattern: string, routingKey: string): boolean {
    const patternParts = pattern.split('.');
    const keyParts = routingKey.split('.');
    let pi = 0, ki = 0;
    while (pi < patternParts.length && ki < keyParts.length) {
      if (patternParts[pi] === '#') return true;
      if (patternParts[pi] === '*' || patternParts[pi] === keyParts[ki]) { pi++; ki++; }
      else return false;
    }
    return pi === patternParts.length && ki === keyParts.length;
  }
}