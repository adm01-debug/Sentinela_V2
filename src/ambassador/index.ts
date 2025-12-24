// Ambassador Pattern - Main Export
export * from "./ambassador";
export * from "./rateLimiter";
export * from "./circuitBreaker";
export * from "./loadBalancer";

import { Ambassador, AmbassadorConfig } from "./ambassador";
import { RateLimiter, RateLimitConfig } from "./rateLimiter";
import { CircuitBreaker, CircuitBreakerConfig } from "./circuitBreaker";
import { AmbassadorLoadBalancer, LBStrategy } from "./loadBalancer";

export interface AmbassadorGatewayConfig extends AmbassadorConfig {
  rateLimit?: RateLimitConfig;
  circuitBreaker?: CircuitBreakerConfig;
  loadBalancer?: { strategy: LBStrategy };
}

export class AmbassadorGateway {
  readonly ambassador: Ambassador;
  readonly rateLimiter?: RateLimiter;
  readonly circuitBreaker?: CircuitBreaker;
  readonly loadBalancer?: AmbassadorLoadBalancer;

  constructor(config: AmbassadorGatewayConfig) {
    this.ambassador = new Ambassador(config);
    if (config.rateLimit) this.rateLimiter = new RateLimiter(config.rateLimit);
    if (config.circuitBreaker) this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    if (config.loadBalancer) this.loadBalancer = new AmbassadorLoadBalancer(config.loadBalancer.strategy);
  }

  async start(): Promise<void> { await this.ambassador.start(); }
  async stop(): Promise<void> { await this.ambassador.stop(); }
}

export const createAmbassador = (config: AmbassadorGatewayConfig) => new AmbassadorGateway(config);
