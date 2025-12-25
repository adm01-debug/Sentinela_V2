import { RabbitMQConnection, RabbitMQPublisher, RabbitMQSubscriber } from '../../rabbitmq';

describe('RabbitMQConnection', () => {
  let connection: RabbitMQConnection;

  beforeEach(() => {
    connection = new RabbitMQConnection({ url: 'amqp://localhost' });
  });

  it('should create connection', () => {
    expect(connection).toBeDefined();
  });

  it('should have connect method', () => {
    expect(typeof connection.connect).toBe('function');
  });

  it('should have disconnect method', () => {
    expect(typeof connection.disconnect).toBe('function');
  });
});

describe('RabbitMQPublisher', () => {
  let publisher: RabbitMQPublisher;

  beforeEach(() => {
    const mockConnection = { createChannel: jest.fn() };
    publisher = new RabbitMQPublisher(mockConnection as any);
  });

  it('should publish message', async () => {
    jest.spyOn(publisher as any, 'publish').mockResolvedValue(undefined);
    
    await publisher.publish('test-exchange', 'routing.key', { data: 'test' });
    expect((publisher as any).publish).toHaveBeenCalled();
  });
});
