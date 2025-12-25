import { Outbox, OutboxProcessor, MessagePublisher } from '../../outboxPattern';

describe('Outbox', () => {
  let outbox: Outbox;

  beforeEach(() => {
    outbox = new Outbox();
  });

  it('should add message to outbox', async () => {
    const message = { type: 'UserCreated', payload: { id: '1' } };
    await outbox.add(message);
    
    const pending = await outbox.getPending();
    expect(pending.length).toBe(1);
    expect(pending[0].type).toBe('UserCreated');
  });

  it('should mark message as published', async () => {
    const message = { type: 'Test', payload: {} };
    const id = await outbox.add(message);
    
    await outbox.markPublished(id);
    const pending = await outbox.getPending();
    
    expect(pending.length).toBe(0);
  });
});

describe('OutboxProcessor', () => {
  it('should process pending messages', async () => {
    const outbox = new Outbox();
    const publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const processor = new OutboxProcessor(outbox, publisher);

    await outbox.add({ type: 'Test', payload: { data: 'test' } });
    await processor.process();

    expect(publisher.publish).toHaveBeenCalled();
  });
});
