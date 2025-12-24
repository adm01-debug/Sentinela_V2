export type SubjectRight = 'access' | 'correction' | 'deletion' | 'portability' | 'revocation';
export interface RightRequest { id: string; userId: string; right: SubjectRight; status: 'pending' | 'processing' | 'completed'; requestedAt: Date; }
export class DataSubjectRights {
  private requests: RightRequest[] = [];
  request(userId: string, right: SubjectRight): RightRequest { const req: RightRequest = { id: crypto.randomUUID(), userId, right, status: 'pending', requestedAt: new Date() }; this.requests.push(req); return req; }
  getByUser(userId: string): RightRequest[] { return this.requests.filter(r => r.userId === userId); }
  updateStatus(id: string, status: RightRequest['status']): void { const req = this.requests.find(r => r.id === id); if (req) req.status = status; }
  getPending(): RightRequest[] { return this.requests.filter(r => r.status === 'pending'); }
}
export const dataSubjectRights = new DataSubjectRights();
