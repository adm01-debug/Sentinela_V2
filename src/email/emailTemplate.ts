export interface EmailTemplate { id: string; name: string; subject: string; body: string; variables: string[]; }
export class EmailTemplateManager {
  private templates = new Map<string, EmailTemplate>();
  create(name: string, subject: string, body: string): EmailTemplate { const variables = (body.match(/\{\{(\w+)\}\}/g) || []).map(v => v.slice(2, -2)); const template: EmailTemplate = { id: crypto.randomUUID(), name, subject, body, variables }; this.templates.set(template.id, template); return template; }
  get(id: string): EmailTemplate | undefined { return this.templates.get(id); }
  render(id: string, data: Record<string, string>): { subject: string; body: string } | null { const template = this.templates.get(id); if (!template) return null; let subject = template.subject; let body = template.body; for (const [key, value] of Object.entries(data)) { const regex = new RegExp('\{\{' + key + '\}\}', 'g'); subject = subject.replace(regex, value); body = body.replace(regex, value); } return { subject, body }; }
  list(): EmailTemplate[] { return Array.from(this.templates.values()); }
}
export const emailTemplateManager = new EmailTemplateManager();
