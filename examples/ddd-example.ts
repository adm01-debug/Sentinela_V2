/**
 * DDD Architecture Example
 */
import { AggregateRoot } from '../src/aggregate';
import { DomainEventDispatcher } from '../src/domainEvents';
import { InMemoryRepository } from '../src/repository';
import { UnitOfWork } from '../src/unitOfWork';

// Domain Event
interface OrderCreated { type: 'OrderCreated'; orderId: string; customerId: string; }

// Aggregate
class Order extends AggregateRoot {
  public items: string[] = [];
  public status = 'pending';
  
  static create(id: string, customerId: string): Order {
    const order = new Order(id);
    order.apply({ type: 'OrderCreated', orderId: id, customerId });
    return order;
  }
  
  addItem(item: string) { this.items.push(item); this.apply({ type: 'ItemAdded', item }); }
  protected onEvent(event: any) {
    if (event.type === 'OrderCreated') this.status = 'created';
  }
}

// Usage
const dispatcher = new DomainEventDispatcher();
dispatcher.register('OrderCreated', (e) => console.log('Order created:', e));

const order = Order.create('order-1', 'customer-1');
order.addItem('Product A');
console.log('Order:', order.id, order.status, order.items);
