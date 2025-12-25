export interface DomainEvent { type: string; occurredAt: Date; aggregateId?: string; [key: string]: unknown; }
export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;
