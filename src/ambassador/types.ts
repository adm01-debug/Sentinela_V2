export interface AmbassadorGatewayConfig {
  port: number;
  routes: RouteConfig[];
  rateLimiting: RateLimitConfig;
  authentication: AuthConfig;
}

export interface RouteConfig {
  path: string;
  service: string;
  methods: string[];
  middleware: string[];
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerSecond: number;
  burstSize: number;
}

export interface AuthConfig {
  enabled: boolean;
  type: 'jwt' | 'apiKey' | 'oauth2';
}