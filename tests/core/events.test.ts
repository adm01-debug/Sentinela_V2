/**
 * @jest-environment node
 */
import { EventEmitter, DomainEventBus, DomainEvent } from '../../src/core/events';

interface TestEvents {
  userCreated: { id: string; name: string };
  userDeleted: { id: string };
}

describe('EventEmitter', () => {
  it('should emit and handle events', async () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = jest.fn();
    
    emitter.on('userCreated', handler);
    await emitter.emit('userCreated', { id: '1', name: 'John' });
    
    expect(handler).toHaveBeenCalledWith({ id: '1', name: 'John' });
  });

  it('should handle multiple listeners', async () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    emitter.on('userCreated', handler1);
    emitter.on('userCreated', handler2);
    await emitter.emit('userCreated', { id: '1', name: 'John' });
    
    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('should unsubscribe', async () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = jest.fn();
    
    const subscription = emitter.on('userCreated', handler);
    subscription.unsubscribe();
    await emitter.emit('userCreated', { id: '1', name: 'John' });
    
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle once', async () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = jest.fn();
    
    emitter.once('userCreated', handler);
    await emitter.emit('userCreated', { id: '1', name: 'John' });
    await emitter.emit('userCreated', { id: '2', name: 'Jane' });
    
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should remove all listeners', async () => {
    const emitter = new EventEmitter<TestEvents>();
    const handler = jest.fn();
    
    emitter.on('userCreated', handler);
    emitter.on('userDeleted', handler);
    emitter.removeAllListeners();
    
    await emitter.emit('userCreated', { id: '1', name: 'John' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should count listeners', () => {
    const emitter = new EventEmitter<TestEvents>();
    
    emitter.on('userCreated', () => {});
    emitter.on('userCreated', () => {});
    
    expect(emitter.listenerCount('userCreated')).toBe(2);
    expect(emitter.listenerCount('userDeleted')).toBe(0);
  });

  it('should handle async handlers', async () => {
    const emitter = new EventEmitter<TestEvents>();
    const results: string[] = [];
    
    emitter.on('userCreated', async () => {
      await new Promise(r => setTimeout(r, 10));
      results.push('a');
    });
    
    await emitter.emit('userCreated', { id: '1', name: 'John' });
    expect(results).toContain('a');
  });
});

describe('DomainEventBus', () => {
  it('should publish and subscribe', async () => {
    const bus = new DomainEventBus();
    const handler = jest.fn();
    
    bus.subscribe('UserCreated', handler);
    
    const event: DomainEvent = {
      eventId: '1',
      eventType: 'UserCreated',
      occurredAt: new Date()
    };
    
    await bus.publish(event);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should support wildcard subscription', async () => {
    const bus = new DomainEventBus();
    const handler = jest.fn();
    
    bus.subscribe('*', handler);
    
    await bus.publish({
      eventId: '1',
      eventType: 'AnyEvent',
      occurredAt: new Date()
    });
    
    expect(handler).toHaveBeenCalled();
  });

  it('should publish all events', async () => {
    const bus = new DomainEventBus();
    const handler = jest.fn();
    
    bus.subscribe('Test', handler);
    
    await bus.publishAll([
      { eventId: '1', eventType: 'Test', occurredAt: new Date() },
      { eventId: '2', eventType: 'Test', occurredAt: new Date() }
    ]);
    
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
