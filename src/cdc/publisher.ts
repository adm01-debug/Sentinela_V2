import { ChangeEvent, SinkConfig } from './types';

export abstract class CDCPublisher {
  abstract publish(event: ChangeEvent): Promise<void>;
  abstract publishBatch(events: ChangeEvent[]): Promise<void>;
}

export class KafkaCDCPublisher extends CDCPublisher {
  constructor(private config: SinkConfig) { super(); }
  
  async publish(event: ChangeEvent): Promise<void> {
    const topic = (this.config.topicPrefix ?? 'cdc') + '.' + event.table;
    console.log('Publishing to Kafka topic:', topic);
  }
  
  async publishBatch(events: ChangeEvent[]): Promise<void> {
    await Promise.all(events.map(e => this.publish(e)));
  }
}

export class HTTPCDCPublisher extends CDCPublisher {
  constructor(private config: SinkConfig) { super(); }
  
  async publish(event: ChangeEvent): Promise<void> {
    console.log('Publishing to HTTP:', this.config.endpoint);
  }
  
  async publishBatch(events: ChangeEvent[]): Promise<void> {
    console.log('Publishing batch of', events.length, 'events to HTTP');
  }
}