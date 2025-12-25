import { EventStore, Event } from '../../src/eventSourcing';

describe('EventStore', () => {
  let store: EventStore;

  beforeEach(() => {
    store = new EventStore();
  });

  it('should append events', async () => {
    const event: Event = {
      id: '1',
      type: 'UserCreated',
      aggregateId: 'user-1',
      data: { name: 'John' },
      timestamp: new Date(),
      version: 1
    };

    await store.append(event);
    const events = await store.getEvents('user-1');
    expect(events).toHaveLength(1);
  });

  it('should get events for aggregate', async () => {
    await store.append({
      id: '1', type: 'Created', aggregateId: 'a1',
      data: {}, timestamp: new Date(), version: 1
    });
    await store.append({
      id: '2', type: 'Updated', aggregateId: 'a1',
      data: {}, timestamp: new Date(), version: 2
    });
    await store.append({
      id: '3', type: 'Created', aggregateId: 'a2',
      data: {}, timestamp: new Date(), version: 1
    });

    const events = await store.getEvents('a1');
    expect(events).toHaveLength(2);
  });

  it('should get events from version', async () => {
    await store.append({
      id: '1', type: 'V1', aggregateId: 'a1',
      data: {}, timestamp: new Date(), version: 1
    });
    await store.append({
      id: '2', type: 'V2', aggregateId: 'a1',
      data: {}, timestamp: new Date(), version: 2
    });

    const events = await store.getEventsFromVersion('a1', 2);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('V2');
  });
});
