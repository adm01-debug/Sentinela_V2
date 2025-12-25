import { AggregateRoot, DomainEvent } from '../../aggregate';

interface OrderCreated extends DomainEvent { orderId: string; customerId: string; }
interface ItemAdded extends DomainEvent { orderId: string; itemId: string; quantity: number; }

class Order extends AggregateRoot {
  private items: string[] = [];
  
  static create(orderId: string, customerId: string): Order {
    const order = new Order(orderId);
    order.apply({ type: 'OrderCreated', orderId, customerId });
    return order;
  }

  addItem(itemId: string, quantity: number): void {
    this.apply({ type: 'ItemAdded', orderId: this.id, itemId, quantity });
  }

  protected onEvent(event: DomainEvent): void {
    if (event.type === 'ItemAdded') {
      this.items.push((event as ItemAdded).itemId);
    }
  }
}

describe('AggregateRoot', () => {
  it('should create aggregate with event', () => {
    const order = Order.create('order-1', 'customer-1');
    expect(order.getUncommittedEvents().length).toBe(1);
  });

  it('should apply multiple events', () => {
    const order = Order.create('order-1', 'customer-1');
    order.addItem('item-1', 2);
    order.addItem('item-2', 1);
    expect(order.getUncommittedEvents().length).toBe(3);
  });

  it('should clear uncommitted events after commit', () => {
    const order = Order.create('order-1', 'customer-1');
    order.commit();
    expect(order.getUncommittedEvents().length).toBe(0);
  });

  it('should increment version', () => {
    const order = Order.create('order-1', 'customer-1');
    expect(order.version).toBe(1);
    order.addItem('item-1', 1);
    expect(order.version).toBe(2);
  });
});
