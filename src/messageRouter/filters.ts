import { Message } from './types';

export interface MessageFilter { accept(message: Message): boolean; }

export class TypeFilter implements MessageFilter {
  constructor(private types: string[]) {}
  accept(message: Message): boolean { return this.types.includes(message.type); }
}

export class HeaderFilter implements MessageFilter {
  constructor(private headerKey: string, private expectedValue: string) {}
  accept(message: Message): boolean { return message.headers[this.headerKey] === this.expectedValue; }
}

export class CompositeFilter implements MessageFilter {
  constructor(private filters: MessageFilter[], private mode: 'all' | 'any' = 'all') {}
  accept(message: Message): boolean {
    return this.mode === 'all' ? this.filters.every(f => f.accept(message)) : this.filters.some(f => f.accept(message));
  }
}

export class FilterChain {
  private filters: MessageFilter[] = [];
  add(filter: MessageFilter): this { this.filters.push(filter); return this; }
  process(messages: Message[]): Message[] { return messages.filter(m => this.filters.every(f => f.accept(m))); }
}