/**
 * Messaging Systems Example
 */
import { KafkaProducer, KafkaConsumer } from '../src/kafka';
import { RabbitMQConnection, RabbitMQPublisher } from '../src/rabbitmq';
import { Outbox, OutboxProcessor } from '../src/outboxPattern';

async function kafkaExample() {
  const producer = new KafkaProducer({ brokers: ['localhost:9092'] });
  await producer.send('orders', { value: JSON.stringify({ orderId: '123' }) });
  
  const consumer = new KafkaConsumer({ brokers: ['localhost:9092'], groupId: 'order-service' });
  await consumer.subscribe('orders');
  consumer.onMessage('orders', (msg) => console.log('Received:', msg));
}

async function rabbitExample() {
  const conn = new RabbitMQConnection({ url: 'amqp://localhost' });
  await conn.connect();
  const publisher = new RabbitMQPublisher(conn);
  await publisher.publish('orders', { orderId: '456' });
}

async function outboxExample() {
  const outbox = new Outbox();
  await outbox.add({ type: 'OrderCreated', payload: { id: '789' } });
  
  const processor = new OutboxProcessor(outbox, async (msg) => {
    console.log('Publishing:', msg);
    return true;
  });
  await processor.process();
}

kafkaExample();
rabbitExample();
outboxExample();
