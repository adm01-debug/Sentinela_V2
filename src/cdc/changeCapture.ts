// Change Data Capture
export interface ChangeEvent { id: string; table: string; operation: "INSERT" | "UPDATE" | "DELETE"; before?: Record<string, unknown>; after?: Record<string, unknown>; timestamp: Date; }
export class ChangeDataCapture {
  private handlers: Map<string, ((event: ChangeEvent) => Promise<void>)[]> = new Map();
  subscribe(table: string, handler: (event: ChangeEvent) => Promise<void>): () => void {
    if (!this.handlers.has(table)) this.handlers.set(table, []);
    this.handlers.get(table)!.push(handler);
    return () => { const handlers = this.handlers.get(table); if (handlers) { const idx = handlers.indexOf(handler); if (idx > -1) handlers.splice(idx, 1); } };
  }
  async capture(event: ChangeEvent): Promise<void> { const handlers = this.handlers.get(event.table) || []; await Promise.all(handlers.map(h => h(event))); }
}
