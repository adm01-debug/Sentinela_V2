import { RabbitMQConnection, RabbitMQPublisher } from '../../rabbitmq';
describe('RabbitMQ', () => {
  it('should connect and publish', async () => {
    const conn = new RabbitMQConnection({ url: 'amqp://localhost' });
    await conn.connect();
    const publisher = new RabbitMQPublisher(conn);
    const result = await publisher.publish('test-queue', { data: 'test' });
    expect(result).toBe(true);
  });
});
