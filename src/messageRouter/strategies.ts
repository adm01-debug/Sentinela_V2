import { Message } from './types';

export interface RoutingStrategy { selectDestination(message: Message, destinations: string[]): string; }

export class RoundRobinStrategy implements RoutingStrategy {
  private index: number = 0;
  selectDestination(message: Message, destinations: string[]): string {
    const dest = destinations[this.index % destinations.length];
    this.index++;
    return dest;
  }
}

export class ContentBasedStrategy implements RoutingStrategy {
  constructor(private rules: { condition: (msg: Message) => boolean; destination: string }[]) {}
  selectDestination(message: Message, destinations: string[]): string {
    for (const rule of this.rules) {
      if (rule.condition(message)) return rule.destination;
    }
    return destinations[0];
  }
}

export class HeaderBasedStrategy implements RoutingStrategy {
  constructor(private headerKey: string, private mapping: Record<string, string>) {}
  selectDestination(message: Message, destinations: string[]): string {
    const headerValue = message.headers[this.headerKey];
    return this.mapping[headerValue] ?? destinations[0];
  }
}