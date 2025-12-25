import { CDCCapturer, ChangeEvent, CDCConfig } from '../../cdc';

describe('CDCCapturer', () => {
  let capturer: CDCCapturer;

  beforeEach(() => {
    capturer = new CDCCapturer({
      source: 'test-db',
      tables: ['users', 'orders']
    });
  });

  afterEach(() => {
    capturer.stop();
  });

  it('should capture insert events', async () => {
    const events: ChangeEvent[] = [];
    capturer.on('change', (e) => events.push(e));

    await capturer.simulateChange({
      type: 'INSERT',
      table: 'users',
      data: { id: 1, name: 'John' }
    });

    expect(events.length).toBe(1);
    expect(events[0].type).toBe('INSERT');
  });

  it('should capture update events', async () => {
    const events: ChangeEvent[] = [];
    capturer.on('change', (e) => events.push(e));

    await capturer.simulateChange({
      type: 'UPDATE',
      table: 'users',
      data: { id: 1, name: 'Jane' },
      oldData: { id: 1, name: 'John' }
    });

    expect(events.length).toBe(1);
    expect(events[0].type).toBe('UPDATE');
    expect(events[0].oldData).toBeDefined();
  });

  it('should capture delete events', async () => {
    const events: ChangeEvent[] = [];
    capturer.on('change', (e) => events.push(e));

    await capturer.simulateChange({
      type: 'DELETE',
      table: 'users',
      data: { id: 1 }
    });

    expect(events.length).toBe(1);
    expect(events[0].type).toBe('DELETE');
  });

  it('should filter by table', async () => {
    const filteredCapturer = new CDCCapturer({
      source: 'test-db',
      tables: ['users']
    });

    const events: ChangeEvent[] = [];
    filteredCapturer.on('change', (e) => events.push(e));

    await filteredCapturer.simulateChange({ type: 'INSERT', table: 'orders', data: {} });
    await filteredCapturer.simulateChange({ type: 'INSERT', table: 'users', data: {} });

    expect(events.length).toBe(1);
    expect(events[0].table).toBe('users');

    filteredCapturer.stop();
  });
});
