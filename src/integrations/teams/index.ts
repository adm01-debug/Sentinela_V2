interface TeamsMessage { text: string; title?: string; themeColor?: string; }

class TeamsClient {
  private webhookUrl: string;

  constructor(webhookUrl: string) { this.webhookUrl = webhookUrl; }

  async sendMessage(message: TeamsMessage) {
    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: message.themeColor || '0076D7',
      summary: message.title || 'Notification',
      sections: [{ activityTitle: message.title, text: message.text }],
    };
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  }
}

export const teams = new TeamsClient(process.env.TEAMS_WEBHOOK_URL || '');
