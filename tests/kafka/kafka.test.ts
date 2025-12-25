import { KafkaProducer, KafkaConsumer, KafkaConfig } from '../../kafka';

describe('KafkaProducer', () => {
  let producer: KafkaProducer;

  beforeEach(() => {
    producer = new KafkaProducer({
      brokers: ['localhost:9092'],
      clientId: 'test-producer'
    });
  });

  afterEach(async () => {
    await producer.disconnect();
  });

  it('should create producer with config', () => {
    expect(producer).toBeDefined();
  });

  it('should queue messages before connecting', async () => {
    const message = { topic: 'test', value: 'hello' };
    await producer.send(message);
    // Message should be queued
    expect(producer.pendingMessages).toBe(1);
  });
});

describe('KafkaConsumer', () => {
  let consumer: KafkaConsumer;

  beforeEach(() => {
    consumer = new KafkaConsumer({
      brokers: ['localhost:9092'],
      groupId: 'test-group'
    });
  });

  afterEach(async () => {
    await consumer.disconnect();
  });

  it('should create consumer with config', () => {
    expect(consumer).toBeDefined();
  });

  it('should register message handler', () => {
    const handler = jest.fn();
    consumer.subscribe('test-topic', handler);
    expect(consumer.hasSubscription('test-topic')).toBe(true);
  });
});
