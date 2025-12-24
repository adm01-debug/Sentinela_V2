export interface VirtualService { name: string; hosts: string[]; http: HTTPRoute[]; }
export interface HTTPRoute { match?: HTTPMatchRequest[]; route: HTTPRouteDestination[]; retries?: HTTPRetry; timeout?: string; }
export interface HTTPMatchRequest { uri?: StringMatch; headers?: Record<string, StringMatch>; }
export interface StringMatch { exact?: string; prefix?: string; regex?: string; }
export interface HTTPRouteDestination { destination: Destination; weight?: number; }
export interface Destination { host: string; port?: { number: number }; subset?: string; }
export interface HTTPRetry { attempts: number; perTryTimeout: string; }