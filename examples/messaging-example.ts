/**
 * Messaging patterns example
 */
import { KafkaProducer, KafkaConsumer } from '../src/kafka';
import { Outbox, OutboxProcessor } from '../src/outboxPattern';
const producer = new KafkaProducer({ brokers: ['localhost:9092'] });
const consumer = new KafkaConsumer({ brokers: ['localhost:9092'], groupId: 'app' });
const outbox = new Outbox();
async function publishWithOutbox(event: { type: string; data: unknown }) {
  const id = await outbox.add({ type: event.type, payload: event.data });
  await producer.send('events', { value: JSON.stringify(event) });
  await outbox.markProcessed(id);
}
