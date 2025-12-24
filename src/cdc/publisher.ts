import { ChangeEvent } from './types';

export interface CDCPublisher {
  publish(event: ChangeEvent): Promise<void>;
}

export class KafkaCDCPublisher implements CDCPublisher {
  constructor(private topic: string) {}
  
  async publish(event: ChangeEvent): Promise<void> {
    console.log('Publishing to Kafka topic', this.topic, ':', event.table, event.operation);
  }
}

export class WebhookCDCPublisher implements CDCPublisher {
  constructor(private webhookUrl: string) {}
  
  async publish(event: ChangeEvent): Promise<void> {
    console.log('Publishing to webhook', this.webhookUrl);
  }
}

export class MultiPublisher implements CDCPublisher {
  private publishers: CDCPublisher[] = [];
  
  add(publisher: CDCPublisher): this { this.publishers.push(publisher); return this; }
  
  async publish(event: ChangeEvent): Promise<void> {
    await Promise.all(this.publishers.map(p => p.publish(event)));
  }
}