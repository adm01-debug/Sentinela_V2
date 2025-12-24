export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'mitigating' | 'resolved' | 'closed';
export interface Incident { id: string; title: string; description: string; severity: IncidentSeverity; status: IncidentStatus; createdAt: Date; updatedAt: Date; assignee?: string; timeline: { timestamp: Date; action: string; actor: string }[]; }
export class IncidentManager {
  private incidents = new Map<string, Incident>();
  create(title: string, description: string, severity: IncidentSeverity): Incident { const incident: Incident = { id: crypto.randomUUID(), title, description, severity, status: 'open', createdAt: new Date(), updatedAt: new Date(), timeline: [{ timestamp: new Date(), action: 'Incident created', actor: 'system' }] }; this.incidents.set(incident.id, incident); return incident; }
  updateStatus(id: string, status: IncidentStatus, actor: string): void { const incident = this.incidents.get(id); if (incident) { incident.status = status; incident.updatedAt = new Date(); incident.timeline.push({ timestamp: new Date(), action: 'Status: ' + status, actor }); } }
  assign(id: string, assignee: string): void { const incident = this.incidents.get(id); if (incident) incident.assignee = assignee; }
  getOpen(): Incident[] { return Array.from(this.incidents.values()).filter(i => i.status !== 'closed'); }
}
export const incidentManager = new IncidentManager();
