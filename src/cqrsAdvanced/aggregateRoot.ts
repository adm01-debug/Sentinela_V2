// Aggregate Root Base Implementation
import { DomainEvent, AggregateRoot as IAggregateRoot, EventMetadata } from './types';
import { EventBuilder } from './eventStore';

export abstract class AggregateRoot<S = unknown> implements IAggregateRoot<S> {
  protected state!: S;
  private _version: number = 0;
  private _uncommittedEvents: DomainEvent[] = [];

  constructor(public readonly id: string) {}

  get version(): number {
    return this._version;
  }

  get uncommittedEvents(): DomainEvent[] {
    return [...this._uncommittedEvents];
  }

  getState(): S {
    return this.state;
  }

  loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.apply(event, false);
      this._version = event.version;
    }
  }

  commit(): DomainEvent[] {
    const events = this._uncommittedEvents;
    this._uncommittedEvents = [];
    return events;
  }

  protected raise<T>(
    eventType: string,
    payload: T,
    metadata?: Partial<EventMetadata>
  ): void {
    const event = EventBuilder.create(
      eventType,
      this.id,
      this.constructor.name,
      payload,
      metadata
    );
    
    this.apply(event, true);
  }

  private apply(event: DomainEvent, isNew: boolean): void {
    const handler = this.getEventHandler(event.eventType);
    if (handler) {
      this.state = handler.call(this, event.payload, this.state);
    }
    
    if (isNew) {
      this._uncommittedEvents.push({
        ...event,
        version: this._version + this._uncommittedEvents.length + 1
      });
    }
  }

  protected abstract getEventHandler(eventType: string): ((payload: unknown, state: S) => S) | null;
  protected abstract createInitialState(): S;
}

// Example implementation
export interface OrderState {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export enum OrderStatus {
  Created = 'created',
  Confirmed = 'confirmed',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled'
}

export class Order extends AggregateRoot<OrderState> {
  static create(id: string, customerId: string): Order {
    const order = new Order(id);
    order.raise('OrderCreated', { customerId });
    return order;
  }

  addItem(productId: string, quantity: number, unitPrice: number): void {
    if (this.state.status !== OrderStatus.Created) {
      throw new Error('Cannot add items to confirmed order');
    }
    this.raise('ItemAdded', { productId, quantity, unitPrice });
  }

  confirm(): void {
    if (this.state.status !== OrderStatus.Created) {
      throw new Error('Order already confirmed');
    }
    if (this.state.items.length === 0) {
      throw new Error('Cannot confirm empty order');
    }
    this.raise('OrderConfirmed', {});
  }

  ship(): void {
    if (this.state.status !== OrderStatus.Confirmed) {
      throw new Error('Order must be confirmed before shipping');
    }
    this.raise('OrderShipped', {});
  }

  cancel(reason: string): void {
    if (this.state.status === OrderStatus.Delivered) {
      throw new Error('Cannot cancel delivered order');
    }
    this.raise('OrderCancelled', { reason });
  }

  protected createInitialState(): OrderState {
    return {
      id: this.id,
      customerId: '',
      items: [],
      status: OrderStatus.Created,
      totalAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  protected getEventHandler(eventType: string): ((payload: unknown, state: OrderState) => OrderState) | null {
    const handlers: Record<string, (payload: any, state: OrderState) => OrderState> = {
      'OrderCreated': (payload, state) => ({
        ...this.createInitialState(),
        customerId: payload.customerId,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      'ItemAdded': (payload, state) => ({
        ...state,
        items: [...state.items, {
          productId: payload.productId,
          quantity: payload.quantity,
          unitPrice: payload.unitPrice
        }],
        totalAmount: state.totalAmount + (payload.quantity * payload.unitPrice),
        updatedAt: new Date()
      }),
      'OrderConfirmed': (_, state) => ({
        ...state,
        status: OrderStatus.Confirmed,
        updatedAt: new Date()
      }),
      'OrderShipped': (_, state) => ({
        ...state,
        status: OrderStatus.Shipped,
        updatedAt: new Date()
      }),
      'OrderCancelled': (_, state) => ({
        ...state,
        status: OrderStatus.Cancelled,
        updatedAt: new Date()
      })
    };
    return handlers[eventType] ?? null;
  }
}
