import { Outbox, OutboxProcessor } from '../../outboxPattern';

describe('Outbox', () => {
  let outbox: Outbox;

  beforeEach(() => {
    outbox = new Outbox({ tableName: 'outbox' });
  });

  it('should add message to outbox', async () => {
    const message = { type: 'OrderCreated', payload: { id: '123' } };
    await outbox.add(message);
    const pending = await outbox.getPending();
    expect(pending.length).toBeGreaterThan(0);
  });

  it('should mark message as processed', async () => {
    const message = { type: 'Test', payload: {} };
    const id = await outbox.add(message);
    await outbox.markProcessed(id);
    const pending = await outbox.getPending();
    expect(pending.find(m => m.id === id)).toBeUndefined();
  });
});

describe('OutboxProcessor', () => {
  it('should process pending messages', async () => {
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const outbox = new Outbox({ tableName: 'test' });
    const processor = new OutboxProcessor(outbox, publisher);

    await outbox.add({ type: 'Event', payload: { data: 'test' } });
    await processor.process();

    expect(publisher.publish).toHaveBeenCalled();
  });
});
