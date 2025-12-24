import { BrokerMessage } from './types';
import { MessageQueue } from './queue';

export class Exchange {
  private bindings: Map<string, MessageQueue[]> = new Map();
  
  constructor(public readonly name: string, public readonly type: 'direct' | 'fanout' | 'topic') {}
  
  bind(routingKey: string, queue: MessageQueue): void {
    const queues = this.bindings.get(routingKey) ?? [];
    queues.push(queue);
    this.bindings.set(routingKey, queues);
  }
  
  unbind(routingKey: string, queue: MessageQueue): void {
    const queues = this.bindings.get(routingKey);
    if (queues) this.bindings.set(routingKey, queues.filter(q => q !== queue));
  }
  
  async publish(routingKey: string, message: BrokerMessage): Promise<void> {
    const targetQueues = this.getTargetQueues(routingKey);
    await Promise.all(targetQueues.map(q => q.enqueue(message)));
  }
  
  private getTargetQueues(routingKey: string): MessageQueue[] {
    switch (this.type) {
      case 'fanout': return Array.from(this.bindings.values()).flat();
      case 'direct': return this.bindings.get(routingKey) ?? [];
      case 'topic': return this.matchTopicQueues(routingKey);
    }
  }
  
  private matchTopicQueues(routingKey: string): MessageQueue[] {
    const result: MessageQueue[] = [];
    this.bindings.forEach((queues, pattern) => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '[^.]+').replace(/#/g, '.*') + '$');
      if (regex.test(routingKey)) result.push(...queues);
    });
    return result;
  }
}