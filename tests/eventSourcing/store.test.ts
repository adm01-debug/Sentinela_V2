import { InMemoryEventStore, SnapshotStore } from '../../eventSourcing';
describe('EventStore', () => {
  let store: InMemoryEventStore;
  beforeEach(() => { store = new InMemoryEventStore(); });
  it('should append and load events', async () => {
    await store.append('agg-1', [{ type: 'Created', version: 1, data: {} }]);
    const events = await store.load('agg-1');
    expect(events.length).toBe(1);
  });
});
describe('SnapshotStore', () => {
  let store: SnapshotStore;
  beforeEach(() => { store = new SnapshotStore(); });
  it('should save and load snapshots', async () => {
    await store.save('agg-1', { state: { value: 10 }, version: 5 });
    const snap = await store.load('agg-1');
    expect(snap?.version).toBe(5);
  });
});
