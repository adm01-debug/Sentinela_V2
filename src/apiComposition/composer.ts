// API Composition
export interface ApiSource { name: string; url: string; transform?: (data: unknown) => unknown; }
export class ApiComposer {
  private sources: ApiSource[] = [];
  addSource(source: ApiSource): void { this.sources.push(source); }
  async compose(): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};
    await Promise.all(this.sources.map(async source => {
      try { const data = await fetch(source.url).then(r => r.json()); results[source.name] = source.transform ? source.transform(data) : data; }
      catch (e) { results[source.name] = { error: (e as Error).message }; }
    }));
    return results;
  }
}
