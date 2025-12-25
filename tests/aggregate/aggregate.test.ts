import { AggregateRoot, DomainEvent } from '../../aggregate';

interface OrderCreated extends DomainEvent {
  type: 'OrderCreated';
  orderId: string;
}

interface ItemAdded extends DomainEvent {
  type: 'ItemAdded';
  itemId: string;
}

class Order extends AggregateRoot {
  private items: string[] = [];

  create(id: string): void {
    this.applyChange<OrderCreated>({ type: 'OrderCreated', orderId: id, timestamp: new Date() });
  }

  addItem(itemId: string): void {
    this.applyChange<ItemAdded>({ type: 'ItemAdded', itemId, timestamp: new Date() });
  }

  protected apply(event: DomainEvent): void {
    switch (event.type) {
      case 'OrderCreated':
        this.id = (event as OrderCreated).orderId;
        break;
      case 'ItemAdded':
        this.items.push((event as ItemAdded).itemId);
        break;
    }
  }
}

describe('AggregateRoot', () => {
  it('should apply and track domain events', () => {
    const order = new Order();
    order.create('order-1');
    order.addItem('item-1');
    
    const events = order.getUncommittedEvents();
    expect(events.length).toBe(2);
    expect(events[0].type).toBe('OrderCreated');
  });

  it('should clear uncommitted events after marking committed', () => {
    const order = new Order();
    order.create('order-1');
    order.markEventsAsCommitted();
    
    expect(order.getUncommittedEvents().length).toBe(0);
  });

  it('should track version', () => {
    const order = new Order();
    order.create('order-1');
    order.addItem('item-1');
    
    expect(order.version).toBe(2);
  });
});
