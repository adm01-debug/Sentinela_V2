export interface SecurityEvent { type: string; severity: 'low' | 'medium' | 'high' | 'critical'; source: string; timestamp: Date; userId?: string; details: Record<string, unknown>; }
export interface SIEMConfig { endpoint: string; batchSize?: number; flushInterval?: number; }
