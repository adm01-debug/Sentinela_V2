// Outbox Pattern - Main Export
export * from "./outboxMessage";
export * from "./outboxRepository";
export * from "./outboxProcessor";
export * from "./outboxService";

import { OutboxService } from "./outboxService";
import { MessagePublisher } from "./outboxProcessor";

// Console Publisher for testing
export class ConsolePublisher implements MessagePublisher {
  async publish(message: import("./outboxMessage").OutboxMessage): Promise<void> {
    console.log(`[Outbox] Publishing: ${message.eventType}`, message.payload);
  }
}

export const createOutboxService = (publisher?: MessagePublisher): OutboxService => {
  return new OutboxService(publisher || new ConsolePublisher());
};
