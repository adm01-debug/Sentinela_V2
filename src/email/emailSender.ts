export interface Email { to: string | string[]; subject: string; body: string; html?: boolean; attachments?: { name: string; content: string }[]; }
export interface EmailResult { id: string; status: 'sent' | 'failed' | 'queued'; timestamp: Date; }
export class EmailSender {
  private config = { from: 'noreply@sentinela.com', provider: 'smtp' };
  configure(config: Partial<typeof this.config>): void { Object.assign(this.config, config); }
  async send(email: Email): Promise<EmailResult> { console.log('Sending email to ' + (Array.isArray(email.to) ? email.to.join(', ') : email.to)); return { id: crypto.randomUUID(), status: 'sent', timestamp: new Date() }; }
  async sendBulk(emails: Email[]): Promise<EmailResult[]> { return Promise.all(emails.map(e => this.send(e))); }
}
export const emailSender = new EmailSender();
