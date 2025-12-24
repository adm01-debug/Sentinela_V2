import { CompositionConfig, CompositionResult, SourceResult } from './types';

export class APIComposer {
  constructor(private config: CompositionConfig) {}
  
  async compose<T>(): Promise<CompositionResult<T>> {
    const start = Date.now();
    const results: SourceResult[] = [];
    const data: Record<string, unknown> = {};
    
    await Promise.all(this.config.services.map(async service => {
      const serviceStart = Date.now();
      try {
        const response = await this.fetchService(service.endpoint);
        const transformed = service.transform ? service.transform(response) : response;
        data[service.name] = transformed;
        results.push({ service: service.name, success: true, duration: Date.now() - serviceStart });
      } catch (e) {
        results.push({ service: service.name, success: false, duration: Date.now() - serviceStart, error: (e as Error).message });
        if (service.required) throw e;
      }
    }));
    
    return { data: data as T, sources: results, duration: Date.now() - start };
  }
  
  private async fetchService(endpoint: string): Promise<unknown> {
    return { endpoint, fetched: true };
  }
}