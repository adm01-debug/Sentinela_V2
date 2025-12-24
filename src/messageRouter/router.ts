import { Message, Route, RoutingResult } from './types';

export class MessageRouter {
  private routes: Route[] = [];
  private defaultDestination?: string;
  
  addRoute(route: Route): void { this.routes.push(route); }
  setDefault(destination: string): void { this.defaultDestination = destination; }
  
  route(message: Message): RoutingResult {
    for (const r of this.routes) {
      if (this.matches(message, r.pattern)) {
        const transformed = r.transform ? r.transform(message) : message;
        return { destination: r.destination, message: transformed, matched: true };
      }
    }
    return { destination: this.defaultDestination ?? 'unknown', message, matched: !!this.defaultDestination };
  }
  
  private matches(message: Message, pattern: string | RegExp): boolean {
    if (pattern instanceof RegExp) return pattern.test(message.type);
    return message.type === pattern || message.type.startsWith(pattern);
  }
  
  getRoutes(): Route[] { return [...this.routes]; }
  removeRoute(pattern: string | RegExp): void { this.routes = this.routes.filter(r => r.pattern !== pattern); }
}