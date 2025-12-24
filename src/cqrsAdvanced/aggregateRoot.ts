// Aggregate Root - CQRS Advanced
import { DomainEvent, EventMetadata } from "./eventStore";
import { v4 as uuid } from "uuid";

export abstract class AggregateRoot<TState = Record<string, unknown>> {
  protected state: TState;
  private uncommittedEvents: DomainEvent[] = [];
  private _version: number = 0;

  constructor(protected readonly id: string, protected readonly aggregateType: string) {
    this.state = this.getInitialState();
  }

  get version(): number {
    return this._version;
  }

  protected abstract getInitialState(): TState;
  protected abstract applyEvent(event: DomainEvent): void;

  protected raise(eventType: string, payload: Record<string, unknown>, metadata: Partial<EventMetadata> = {}): void {
    const event: DomainEvent = {
      eventId: uuid(),
      eventType,
      aggregateId: this.id,
      aggregateType: this.aggregateType,
      version: this._version + this.uncommittedEvents.length + 1,
      payload,
      metadata: {
        correlationId: metadata.correlationId || uuid(),
        causationId: metadata.causationId,
        userId: metadata.userId
      },
      timestamp: new Date()
    };

    this.applyEvent(event);
    this.uncommittedEvents.push(event);
  }

  loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.applyEvent(event);
      this._version = event.version;
    }
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }

  getSnapshot(): { state: TState; version: number } {
    return { state: { ...this.state }, version: this._version };
  }

  restoreFromSnapshot(snapshot: { state: TState; version: number }): void {
    this.state = { ...snapshot.state };
    this._version = snapshot.version;
  }
}

// Example: Order Aggregate
interface OrderState {
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  customerId: string;
}

export class OrderAggregate extends AggregateRoot<OrderState> {
  constructor(id: string) {
    super(id, "Order");
  }

  protected getInitialState(): OrderState {
    return { status: "pending", items: [], totalAmount: 0, customerId: "" };
  }

  protected applyEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case "OrderCreated":
        this.state.customerId = event.payload.customerId as string;
        this.state.items = event.payload.items as OrderState["items"];
        this.state.totalAmount = this.state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        break;
      case "OrderConfirmed":
        this.state.status = "confirmed";
        break;
      case "OrderShipped":
        this.state.status = "shipped";
        break;
      case "OrderCancelled":
        this.state.status = "cancelled";
        break;
    }
  }

  create(customerId: string, items: OrderState["items"], metadata?: Partial<EventMetadata>): void {
    if (this.state.items.length > 0) throw new Error("Order already created");
    this.raise("OrderCreated", { customerId, items }, metadata);
  }

  confirm(metadata?: Partial<EventMetadata>): void {
    if (this.state.status !== "pending") throw new Error("Can only confirm pending orders");
    this.raise("OrderConfirmed", {}, metadata);
  }

  cancel(reason: string, metadata?: Partial<EventMetadata>): void {
    if (this.state.status === "shipped") throw new Error("Cannot cancel shipped orders");
    this.raise("OrderCancelled", { reason }, metadata);
  }
}
