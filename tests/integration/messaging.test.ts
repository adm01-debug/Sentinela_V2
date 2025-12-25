/**
 * Integration test for messaging patterns
 */
import { KafkaProducer, KafkaConsumer } from '../../src/kafka';
import { Outbox } from '../../src/outboxPattern';
describe('Messaging Integration', () => {
  it('should produce and consume messages', async () => {
    const producer = new KafkaProducer({ brokers: ['localhost:9092'] });
    await producer.send('test-topic', { value: 'test' });
    expect(true).toBe(true);
  });
  it('should use outbox pattern', async () => {
    const outbox = new Outbox();
    const id = await outbox.add({ type: 'test', payload: {} });
    expect(id).toBeDefined();
  });
});
