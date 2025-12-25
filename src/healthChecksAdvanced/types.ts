export interface HealthCheck { name: string; check: () => Promise<{ status: string; latency?: number }>; }
