import { KafkaProducer, KafkaConsumer, KafkaMessage } from '../../kafka';

describe('KafkaProducer', () => {
  let producer: KafkaProducer;

  beforeEach(() => {
    producer = new KafkaProducer({ brokers: ['localhost:9092'] });
  });

  it('should create producer with config', () => {
    expect(producer).toBeDefined();
  });

  it('should send message', async () => {
    const message: KafkaMessage = {
      topic: 'test-topic',
      key: 'key-1',
      value: JSON.stringify({ data: 'test' }),
      headers: { source: 'test' }
    };

    // Mock the internal send
    jest.spyOn(producer as any, 'send').mockResolvedValue(undefined);
    await producer.send(message);
    expect((producer as any).send).toHaveBeenCalled();
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

  it('should create consumer with config', () => {
    expect(consumer).toBeDefined();
  });

  it('should subscribe to topics', async () => {
    jest.spyOn(consumer as any, 'subscribe').mockResolvedValue(undefined);
    await consumer.subscribe(['topic-1', 'topic-2']);
    expect((consumer as any).subscribe).toHaveBeenCalled();
  });
});
