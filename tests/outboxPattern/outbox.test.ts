import { Outbox, OutboxProcessor } from '../../outboxPattern';
describe('Outbox', () => {
  let outbox: Outbox;
  beforeEach(() => { outbox = new Outbox(); });
  it('should add messages', async () => {
    await outbox.add({ type: 'OrderCreated', payload: { id: '1' } });
    const pending = await outbox.getPending();
    expect(pending.length).toBe(1);
  });
  it('should mark processed', async () => {
    const id = await outbox.add({ type: 'Test', payload: {} });
    await outbox.markProcessed(id);
    const pending = await outbox.getPending();
    expect(pending.length).toBe(0);
  });
});
