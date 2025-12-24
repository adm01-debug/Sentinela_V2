export class CDNPurger {
  private pendingPurges: PurgeRequest[] = [];
  
  purgeUrl(url: string): PurgeRequest {
    const request: PurgeRequest = { id: Date.now().toString(), type: 'url', target: url, status: 'pending', createdAt: new Date() };
    this.pendingPurges.push(request);
    return request;
  }
  
  purgeTag(tag: string): PurgeRequest {
    const request: PurgeRequest = { id: Date.now().toString(), type: 'tag', target: tag, status: 'pending', createdAt: new Date() };
    this.pendingPurges.push(request);
    return request;
  }
  
  purgeAll(): PurgeRequest {
    const request: PurgeRequest = { id: Date.now().toString(), type: 'all', target: '*', status: 'pending', createdAt: new Date() };
    this.pendingPurges.push(request);
    return request;
  }
  
  async execute(request: PurgeRequest): Promise<void> {
    request.status = 'processing';
    await new Promise(r => setTimeout(r, 100));
    request.status = 'completed';
    request.completedAt = new Date();
  }
  
  getPending(): PurgeRequest[] { return this.pendingPurges.filter(p => p.status === 'pending'); }
}

export interface PurgeRequest { id: string; type: 'url' | 'tag' | 'all'; target: string; status: 'pending' | 'processing' | 'completed' | 'failed'; createdAt: Date; completedAt?: Date; }