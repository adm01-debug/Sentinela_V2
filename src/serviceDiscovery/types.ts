export interface ServiceInstance { id: string; name: string; host: string; port: number; metadata?: Record<string, string>; healthStatus: string; registeredAt: Date; }
