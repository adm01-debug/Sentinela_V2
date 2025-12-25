export interface OutboxMessage { id?: string; type: string; payload: unknown; createdAt?: Date; processedAt?: Date; }
