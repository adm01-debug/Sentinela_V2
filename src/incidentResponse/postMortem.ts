import { Incident } from './incidentManager';
export interface PostMortem { id: string; incidentId: string; title: string; summary: string; timeline: { timestamp: Date; event: string }[]; rootCause: string; impact: string; lessonsLearned: string[]; actionItems: { action: string; owner: string; dueDate: Date }[]; createdAt: Date; }
export class PostMortemManager {
  private postMortems = new Map<string, PostMortem>();
  create(incident: Incident): PostMortem { const pm: PostMortem = { id: crypto.randomUUID(), incidentId: incident.id, title: 'Post-Mortem: ' + incident.title, summary: '', timeline: incident.timeline.map(t => ({ timestamp: t.timestamp, event: t.action })), rootCause: '', impact: '', lessonsLearned: [], actionItems: [], createdAt: new Date() }; this.postMortems.set(pm.id, pm); return pm; }
  update(id: string, updates: Partial<PostMortem>): void { const pm = this.postMortems.get(id); if (pm) Object.assign(pm, updates); }
  getByIncident(incidentId: string): PostMortem | undefined { return Array.from(this.postMortems.values()).find(p => p.incidentId === incidentId); }
}
export const postMortemManager = new PostMortemManager();
