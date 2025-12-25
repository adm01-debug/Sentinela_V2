export interface DomainEvent { type: string; occurredAt: Date; aggregateId: string; }
export interface Entity { id: string; }
