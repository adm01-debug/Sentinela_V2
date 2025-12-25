import { RabbitMQConnection, RabbitMQPublisher } from '../../rabbitmq';

describe('RabbitMQConnection', () => {
  let connection: RabbitMQConnection;

  beforeEach(() => {
    connection = new RabbitMQConnection({
      url: 'amqp://localhost:5672',
      reconnectAttempts: 3
    });
  });

  afterEach(async () => {
    await connection.close();
  });

  it('should create connection with config', () => {
    expect(connection).toBeDefined();
  });

  it('should track connection state', () => {
    expect(connection.isConnected()).toBe(false);
  });
});

describe('RabbitMQPublisher', () => {
  let publisher: RabbitMQPublisher;

  beforeEach(() => {
    publisher = new RabbitMQPublisher({
      url: 'amqp://localhost:5672',
      exchange: 'test-exchange'
    });
  });

  afterEach(async () => {
    await publisher.close();
  });

  it('should create publisher with exchange', () => {
    expect(publisher.exchangeName).toBe('test-exchange');
  });

  it('should queue messages before connecting', async () => {
    await publisher.publish('routing.key', { data: 'test' });
    expect(publisher.pendingMessages).toBe(1);
  });
});
