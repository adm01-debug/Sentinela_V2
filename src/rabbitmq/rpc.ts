// RabbitMQ RPC
import { RabbitConnection } from "./connection";
export class RabbitRPC {
  private pending: Map<string, (result: unknown) => void> = new Map();
  constructor(private connection: RabbitConnection) {}
  async call(queue: string, message: unknown, timeout: number = 30000): Promise<unknown> {
    const correlationId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(correlationId); reject(new Error("RPC timeout")); }, timeout);
      this.pending.set(correlationId, (result) => { clearTimeout(timer); resolve(result); });
      console.log("[RabbitMQ RPC] Called", queue);
    });
  }
}
