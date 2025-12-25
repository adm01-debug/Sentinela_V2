import { EventStore, EventSourcedAggregate } from '../../eventSourcing';

describe('EventStore', () => {
  let store: EventStore;
  beforeEach(() => { store = new EventStore(); });

  it('should append and load events', async () => {
    const events = [
      { type: 'Created', data: { id: '1' }, version: 1 },
      { type: 'Updated', data: { name: 'test' }, version: 2 }
    ];
    await store.append('aggregate-1', events);
    const loaded = await store.load('aggregate-1');
    expect(loaded.length).toBe(2);
  });

  it('should load events from version', async () => {
    await store.append('agg-1', [
      { type: 'E1', data: {}, version: 1 },
      { type: 'E2', data: {}, version: 2 },
      { type: 'E3', data: {}, version: 3 }
    ]);
    const events = await store.load('agg-1', 2);
    expect(events.length).toBe(2);
  });
});
