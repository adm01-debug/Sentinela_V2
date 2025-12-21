interface SendgridConfig { apiKey: string; }

class SendgridClient {
  constructor(private config: SendgridConfig) {}
  async sendEmail(to: string, subject: string, html: string, from: string = 'noreply@sentinela.app') {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], from: { email: from }, subject, content: [{ type: 'text/html', value: html }] })
    });
    return res.ok;
  }
}

export const sendgrid = new SendgridClient({ apiKey: process.env.SENDGRID_API_KEY || '' });