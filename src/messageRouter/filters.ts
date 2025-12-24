import { Message } from './types';

export interface MessageFilter {
  filter(message: Message): boolean;
}

export class TypeFilter implements MessageFilter {
  constructor(private allowedTypes: Set<string>) {}
  filter(message: Message): boolean { return this.allowedTypes.has(message.type); }
}

export class HeaderFilter implements MessageFilter {
  constructor(private requiredHeaders: string[]) {}
  filter(message: Message): boolean { return this.requiredHeaders.every(h => h in message.headers); }
}

export class CompositeFilter implements MessageFilter {
  constructor(private filters: MessageFilter[], private mode: 'all' | 'any' = 'all') {}
  filter(message: Message): boolean {
    return this.mode === 'all' ? this.filters.every(f => f.filter(message)) : this.filters.some(f => f.filter(message));
  }
}

export class ContentFilter implements MessageFilter {
  constructor(private predicate: (payload: unknown) => boolean) {}
  filter(message: Message): boolean { return this.predicate(message.payload); }
}