export interface CircuitBreakerConfig { threshold: number; resetTimeout: number; }
export const defaultConfig: CircuitBreakerConfig = { threshold: 5, resetTimeout: 30000 };
