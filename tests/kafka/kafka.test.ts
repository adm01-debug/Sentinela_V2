import { KafkaProducer, KafkaConsumer } from '../../kafka';

describe('KafkaProducer', () => {
  let producer: KafkaProducer;
  beforeEach(() => { producer = new KafkaProducer({ brokers: ['localhost:9092'] }); });
  afterEach(async () => { await producer.disconnect(); });

  it('should send message', async () => {
    const result = await producer.send('test-topic', { key: 'key1', value: JSON.stringify({ data: 'test' }) });
    expect(result).toBeDefined();
  });

  it('should send batch', async () => {
    const messages = [{ key: 'k1', value: 'v1' }, { key: 'k2', value: 'v2' }];
    const result = await producer.sendBatch('test-topic', messages);
    expect(result).toBeDefined();
  });
});

describe('KafkaConsumer', () => {
  it('should subscribe to topic', async () => {
    const consumer = new KafkaConsumer({ brokers: ['localhost:9092'], groupId: 'test-group' });
    await consumer.subscribe('test-topic');
    expect(consumer.isSubscribed('test-topic')).toBe(true);
    await consumer.disconnect();
  });
});
