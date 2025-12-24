export interface Message {
  id: string;
  type: string;
  payload: unknown;
  headers: Record<string, string>;
  timestamp: Date;
}

export interface Route {
  name: string;
  condition: RouteCondition;
  destination: string;
  transform?: (message: Message) => Message;
}

export type RouteCondition = (message: Message) => boolean;

export interface RouterConfig {
  defaultRoute?: string;
  errorRoute?: string;
  routes: Route[];
}