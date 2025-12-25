import { RabbitMQConnection, RabbitMQPublisher } from '../../rabbitmq';

describe('RabbitMQConnection', () => {
  let connection: RabbitMQConnection;
  beforeEach(() => { connection = new RabbitMQConnection({ url: 'amqp://localhost' }); });

  it('should create channel', async () => {
    const channel = await connection.createChannel();
    expect(channel).toBeDefined();
  });
});

describe('RabbitMQPublisher', () => {
  it('should publish message', async () => {
    const conn = new RabbitMQConnection({ url: 'amqp://localhost' });
    const publisher = new RabbitMQPublisher(conn);
    const result = await publisher.publish('test-queue', { data: 'test' });
    expect(result).toBe(true);
  });
});
