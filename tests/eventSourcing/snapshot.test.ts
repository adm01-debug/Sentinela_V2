import { SnapshotStore } from '../../eventSourcing';

describe('SnapshotStore', () => {
  let store: SnapshotStore;
  beforeEach(() => { store = new SnapshotStore(); });

  it('should save and load snapshot', async () => {
    await store.save('agg-1', { state: 'active', version: 10 });
    const snapshot = await store.load('agg-1');
    expect(snapshot.version).toBe(10);
  });
});
