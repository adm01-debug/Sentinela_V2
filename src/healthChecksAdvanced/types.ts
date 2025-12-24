export interface HealthCheck { name: string; check: () => Promise<HealthResult>; timeout: number; critical: boolean; }
export interface HealthResult { status: HealthStatus; message?: string; details?: Record<string, unknown>; duration: number; }
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export interface SystemHealth { status: HealthStatus; checks: Record<string, HealthResult>; timestamp: Date; }