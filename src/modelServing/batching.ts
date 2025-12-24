import { InferenceRequest, InferenceResponse } from './types';

export class RequestBatcher {
  private batch: InferenceRequest[] = [];
  private timer?: NodeJS.Timeout;
  private resolvers: ((response: InferenceResponse) => void)[] = [];
  
  constructor(private maxSize: number, private timeoutMs: number, private processor: (batch: InferenceRequest[]) => Promise<InferenceResponse[]>) {}
  
  async add(request: InferenceRequest): Promise<InferenceResponse> {
    return new Promise((resolve) => {
      this.batch.push(request);
      this.resolvers.push(resolve);
      
      if (this.batch.length >= this.maxSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.timeoutMs);
      }
    });
  }
  
  private async flush(): Promise<void> {
    if (this.timer) { clearTimeout(this.timer); this.timer = undefined; }
    if (this.batch.length === 0) return;
    
    const batch = this.batch;
    const resolvers = this.resolvers;
    this.batch = [];
    this.resolvers = [];
    
    const responses = await this.processor(batch);
    responses.forEach((r, i) => resolvers[i]?.(r));
  }
}