// Composition Gateway
import { ApiComposer, ApiSource } from "./composer";
export class CompositionGateway {
  private composers: Map<string, ApiComposer> = new Map();
  createEndpoint(name: string, sources: ApiSource[]): void { const composer = new ApiComposer(); for (const source of sources) composer.addSource(source); this.composers.set(name, composer); }
  async execute(endpoint: string): Promise<Record<string, unknown>> { const composer = this.composers.get(endpoint); if (!composer) throw new Error("Endpoint not found: " + endpoint); return composer.compose(); }
  listEndpoints(): string[] { return Array.from(this.composers.keys()); }
}
