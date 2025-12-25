import { EventStore, Snapshot } from '../../eventSourcing';

describe('EventStore', () => {
  let store: EventStore;

  beforeEach(() => {
    store = new EventStore();
  });

  it('should append and retrieve events', async () => {
    const events = [
      { type: 'Created', data: { name: 'Test' }, timestamp: new Date() },
      { type: 'Updated', data: { name: 'Updated' }, timestamp: new Date() }
    ];

    await store.append('stream-1', events);
    const retrieved = await store.getEvents('stream-1');

    expect(retrieved.length).toBe(2);
    expect(retrieved[0].type).toBe('Created');
  });

  it('should get events from version', async () => {
    const events = [
      { type: 'E1', data: {}, timestamp: new Date(), version: 1 },
      { type: 'E2', data: {}, timestamp: new Date(), version: 2 },
      { type: 'E3', data: {}, timestamp: new Date(), version: 3 }
    ];

    await store.append('stream-1', events);
    const fromV2 = await store.getEvents('stream-1', 2);

    expect(fromV2.length).toBe(2);
  });
});

describe('Snapshot', () => {
  it('should save and load snapshot', async () => {
    const snapshot = new Snapshot();
    const state = { id: '1', name: 'Test', version: 10 };

    await snapshot.save('aggregate-1', state, 10);
    const loaded = await snapshot.load('aggregate-1');

    expect(loaded?.state).toEqual(state);
    expect(loaded?.version).toBe(10);
  });
});
