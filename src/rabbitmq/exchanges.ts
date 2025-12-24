import { ExchangeOptions } from './types';

export class ExchangeManager {
  private exchanges: Map<string, Exchange> = new Map();
  
  declare(name: string, options: ExchangeOptions): Exchange {
    const exchange = new Exchange(name, options);
    this.exchanges.set(name, exchange);
    return exchange;
  }
  
  get(name: string): Exchange | undefined { return this.exchanges.get(name); }
  delete(name: string): boolean { return this.exchanges.delete(name); }
}

export class Exchange {
  private bindings: Binding[] = [];
  constructor(public name: string, public options: ExchangeOptions) {}
  
  bind(queue: string, routingKey: string): void { this.bindings.push({ queue, routingKey }); }
  unbind(queue: string, routingKey: string): void {
    this.bindings = this.bindings.filter(b => !(b.queue === queue && b.routingKey === routingKey));
  }
  
  getBindings(): Binding[] { return [...this.bindings]; }
  
  route(routingKey: string): string[] {
    switch (this.options.type) {
      case 'fanout': return this.bindings.map(b => b.queue);
      case 'direct': return this.bindings.filter(b => b.routingKey === routingKey).map(b => b.queue);
      case 'topic': return this.bindings.filter(b => this.matchTopic(b.routingKey, routingKey)).map(b => b.queue);
      default: return [];
    }
  }
  
  private matchTopic(pattern: string, key: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '[^.]+').replace(/#/g, '.*') + '$');
    return regex.test(key);
  }
}

interface Binding { queue: string; routingKey: string; }