import { EventStore, Snapshot, AggregateStream } from '../../eventSourcing';

interface AccountEvent {
  type: string;
  amount?: number;
  timestamp: Date;
}

describe('EventStore', () => {
  let store: EventStore<AccountEvent>;

  beforeEach(() => {
    store = new EventStore<AccountEvent>();
  });

  it('should append events to stream', async () => {
    await store.append({
      streamId: 'account-123',
      event: { type: 'Deposited', amount: 100, timestamp: new Date() }
    });

    const events = await store.getEvents('account-123');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('Deposited');
  });

  it('should return events in order', async () => {
    await store.append({
      streamId: 'account-123',
      event: { type: 'Deposited', amount: 100, timestamp: new Date() }
    });
    await store.append({
      streamId: 'account-123',
      event: { type: 'Withdrawn', amount: 50, timestamp: new Date() }
    });

    const events = await store.getEvents('account-123');
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('Deposited');
    expect(events[1].type).toBe('Withdrawn');
  });

  it('should return empty array for unknown stream', async () => {
    const events = await store.getEvents('unknown');
    expect(events).toHaveLength(0);
  });
});

describe('Snapshot', () => {
  it('should create snapshot from state', () => {
    const snapshot = new Snapshot({
      streamId: 'account-123',
      version: 10,
      state: { balance: 500 }
    });

    expect(snapshot.version).toBe(10);
    expect(snapshot.state.balance).toBe(500);
  });
});
