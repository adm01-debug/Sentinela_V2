/**
 * @fileoverview K8s Operator
 * @module @sentinela/core/operators
 */
export interface CustomResource { apiVersion: string; kind: string; metadata: { name: string }; spec: unknown; }
export class Operator {
  private watching = false;
  constructor(private config: { kind: string }) {}
  async start(): Promise<void> { this.watching = true; }
  async stop(): Promise<void> { this.watching = false; }
  isWatching(): boolean { return this.watching; }
  async reconcile(resource: CustomResource): Promise<void> { /* reconcile logic */ }
}
