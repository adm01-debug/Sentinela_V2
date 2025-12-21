interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string }>;
}

interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
}

class EmailClient {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@sentinela.app';
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from || this.fromEmail,
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }

  async sendTemplate(template: string, to: string, data: Record<string, unknown>): Promise<boolean> {
    const templates: Record<string, EmailTemplate> = {
      welcome: {
        name: 'welcome',
        subject: 'Welcome to Sentinela',
        html: '<h1>Welcome {{name}}!</h1><p>Thanks for joining.</p>',
      },
      violation_alert: {
        name: 'violation_alert',
        subject: 'Violation Alert - {{type}}',
        html: '<h1>Violation Detected</h1><p>{{message}}</p>',
      },
    };

    const tpl = templates[template];
    if (!tpl) throw new Error(`Template not found: ${template}`);

    let html = tpl.html;
    let subject = tpl.subject;
    
    for (const [key, value] of Object.entries(data)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return this.send({ to, subject, html });
  }
}

export const email = new EmailClient();
