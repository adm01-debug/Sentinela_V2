interface MailchimpConfig { apiKey: string; server: string; }

class MailchimpClient {
  constructor(private config: MailchimpConfig) {}
  async addSubscriber(listId: string, email: string) {
    const auth = btoa(`anystring:${this.config.apiKey}`);
    const res = await fetch(`https://${this.config.server}.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_address: email, status: 'subscribed' })
    });
    return res.json();
  }
}

export const mailchimp = new MailchimpClient({ apiKey: process.env.MAILCHIMP_API_KEY || '', server: process.env.MAILCHIMP_SERVER || '' });