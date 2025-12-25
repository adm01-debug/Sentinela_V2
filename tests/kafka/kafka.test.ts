import { KafkaProducer, KafkaConsumer } from '../../kafka';
describe('KafkaProducer', () => {
  it('should send messages', async () => {
    const producer = new KafkaProducer({ brokers: ['localhost:9092'] });
    const result = await producer.send('test-topic', { value: '{"test":true}' });
    expect(result.partition).toBeDefined();
  });
});
describe('KafkaConsumer', () => {
  it('should subscribe to topics', async () => {
    const consumer = new KafkaConsumer({ brokers: ['localhost:9092'], groupId: 'test' });
    await consumer.subscribe('test-topic');
    expect(consumer.isSubscribed('test-topic')).toBe(true);
  });
});
