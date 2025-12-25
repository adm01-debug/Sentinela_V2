import { KafkaProducer, KafkaConfig } from '../../src/kafka';

describe('KafkaProducer', () => {
  it('should create producer with config', () => {
    const config: KafkaConfig = {
      brokers: ['localhost:9092'],
      clientId: 'test-client'
    };
    
    const producer = new KafkaProducer(config);
    expect(producer).toBeDefined();
  });

  it('should validate topic name', () => {
    const config: KafkaConfig = {
      brokers: ['localhost:9092'],
      clientId: 'test-client'
    };
    
    const producer = new KafkaProducer(config);
    expect(() => producer.validateTopic('')).toThrow();
  });
});
