import { Outbox, OutboxEntry } from '../../src/outboxPattern';

describe('Outbox', () => {
  let outbox: Outbox;

  beforeEach(() => {
    outbox = new Outbox();
  });

  it('should add message', async () => {
    const entry: OutboxEntry = {
      aggregateType: 'Order',
      aggregateId: '123',
      eventType: 'OrderCreated',
      payload: { amount: 100 }
    };

    const message = await outbox.add(entry);
    expect(message.id).toBeDefined();
    expect(message.status).toBe('pending');
  });

  it('should get pending messages', async () => {
    await outbox.add({
      aggregateType: 'Order',
      aggregateId: '1',
      eventType: 'Created',
      payload: {}
    });

    const pending = await outbox.getPending();
    expect(pending.length).toBe(1);
  });

  it('should mark as published', async () => {
    const message = await outbox.add({
      aggregateType: 'Order',
      aggregateId: '1',
      eventType: 'Created',
      payload: {}
    });

    await outbox.markPublished(message.id);
    const pending = await outbox.getPending();
    expect(pending.length).toBe(0);
  });

  it('should mark as failed with retry', async () => {
    const message = await outbox.add({
      aggregateType: 'Order',
      aggregateId: '1',
      eventType: 'Created',
      payload: {}
    });

    await outbox.markFailed(message.id, 'Connection error');
    const pending = await outbox.getPending();
    expect(pending.length).toBe(1);
  });
});
