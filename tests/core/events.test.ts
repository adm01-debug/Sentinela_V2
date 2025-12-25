import { EventBus, Subject, BehaviorSubject } from '../../core/events';

describe('EventBus', () => {
  interface Events {
    userCreated: { id: string; name: string };
    userDeleted: { id: string };
  }

  let bus: EventBus<Events>;

  beforeEach(() => {
    bus = new EventBus<Events>();
  });

  afterEach(() => {
    bus.dispose();
  });

  it('should emit and receive events', async () => {
    const handler = jest.fn();
    bus.on('userCreated', handler);
    
    await bus.emit('userCreated', { id: '1', name: 'John' });
    
    expect(handler).toHaveBeenCalledWith({ id: '1', name: 'John' });
  });

  it('should handle once listeners', async () => {
    const handler = jest.fn();
    bus.once('userCreated', handler);
    
    await bus.emit('userCreated', { id: '1', name: 'John' });
    await bus.emit('userCreated', { id: '2', name: 'Jane' });
    
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe', async () => {
    const handler = jest.fn();
    const unsubscribe = bus.on('userCreated', handler);
    
    unsubscribe();
    await bus.emit('userCreated', { id: '1', name: 'John' });
    
    expect(handler).not.toHaveBeenCalled();
  });

  it('should count listeners', () => {
    bus.on('userCreated', () => {});
    bus.on('userCreated', () => {});
    bus.once('userCreated', () => {});
    
    expect(bus.listenerCount('userCreated')).toBe(3);
  });
});

describe('Subject', () => {
  it('should emit to subscribers', () => {
    const subject = new Subject<number>();
    const values: number[] = [];
    
    subject.subscribe({ next: v => values.push(v) });
    subject.next(1);
    subject.next(2);
    
    expect(values).toEqual([1, 2]);
  });

  it('should complete and stop emitting', () => {
    const subject = new Subject<number>();
    const complete = jest.fn();
    
    subject.subscribe({ next: () => {}, complete });
    subject.complete();
    subject.next(1);
    
    expect(complete).toHaveBeenCalled();
  });
});

describe('BehaviorSubject', () => {
  it('should emit current value to new subscribers', () => {
    const subject = new BehaviorSubject<number>(10);
    const values: number[] = [];
    
    subject.next(20);
    subject.subscribe({ next: v => values.push(v) });
    
    expect(values).toEqual([20]);
  });

  it('should get current value', () => {
    const subject = new BehaviorSubject<string>('initial');
    subject.next('updated');
    
    expect(subject.getValue()).toBe('updated');
  });
});
