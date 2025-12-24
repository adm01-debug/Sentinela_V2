import { Message, Route, RouterConfig } from './types';

export class MessageRouter {
  private routes: Route[] = [];
  private destinations: Map<string, (message: Message) => Promise<void>> = new Map();
  
  constructor(private config: RouterConfig) { this.routes = config.routes; }
  
  registerDestination(name: string, handler: (message: Message) => Promise<void>): void { this.destinations.set(name, handler); }
  
  async route(message: Message): Promise<RoutingResult> {
    const matchedRoutes = this.routes.filter(r => r.condition(message));
    if (matchedRoutes.length === 0 && this.config.defaultRoute) {
      const defaultHandler = this.destinations.get(this.config.defaultRoute);
      if (defaultHandler) { await defaultHandler(message); return { routed: true, destinations: [this.config.defaultRoute] }; }
    }
    const destinations: string[] = [];
    for (const route of matchedRoutes) {
      const handler = this.destinations.get(route.destination);
      if (handler) {
        const transformed = route.transform ? route.transform(message) : message;
        await handler(transformed);
        destinations.push(route.destination);
      }
    }
    return { routed: destinations.length > 0, destinations };
  }
  
  addRoute(route: Route): void { this.routes.push(route); }
  removeRoute(name: string): void { this.routes = this.routes.filter(r => r.name !== name); }
}

export interface RoutingResult { routed: boolean; destinations: string[]; }