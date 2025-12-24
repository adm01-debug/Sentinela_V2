import { Message, RouteCondition } from './types';

export const RouteRules = {
  byType: (types: string[]): RouteCondition => (msg) => types.includes(msg.type),
  byHeader: (key: string, value: string): RouteCondition => (msg) => msg.headers[key] === value,
  byHeaderExists: (key: string): RouteCondition => (msg) => key in msg.headers,
  byPayloadField: (field: string, value: unknown): RouteCondition => (msg) => (msg.payload as any)?.[field] === value,
  and: (...conditions: RouteCondition[]): RouteCondition => (msg) => conditions.every(c => c(msg)),
  or: (...conditions: RouteCondition[]): RouteCondition => (msg) => conditions.some(c => c(msg)),
  not: (condition: RouteCondition): RouteCondition => (msg) => !condition(msg),
  always: (): RouteCondition => () => true,
  never: (): RouteCondition => () => false,
  regex: (field: 'type' | 'id', pattern: RegExp): RouteCondition => (msg) => pattern.test(msg[field])
};

export class RuleBuilder {
  private conditions: RouteCondition[] = [];
  type(...types: string[]): this { this.conditions.push(RouteRules.byType(types)); return this; }
  header(key: string, value: string): this { this.conditions.push(RouteRules.byHeader(key, value)); return this; }
  payload(field: string, value: unknown): this { this.conditions.push(RouteRules.byPayloadField(field, value)); return this; }
  build(): RouteCondition { return RouteRules.and(...this.conditions); }
}