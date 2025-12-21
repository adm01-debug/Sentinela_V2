interface SlackMessage {
  channel?: string;
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  elements?: unknown[];
}

interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: Array<{ title: string; value: string; short?: boolean }>;
}

class SlackClient {
  private webhookUrl: string;
  private botToken: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.botToken = process.env.SLACK_BOT_TOKEN || '';
  }

  async sendWebhook(message: SlackMessage): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      return response.ok;
    } catch (error) {
      console.error('Slack webhook failed:', error);
      return false;
    }
  }

  async sendMessage(channel: string, text: string, blocks?: SlackBlock[]): Promise<boolean> {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel, text, blocks }),
      });
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Slack message failed:', error);
      return false;
    }
  }

  async sendViolationAlert(violation: { type: string; employee: string; severity: string }) {
    return this.sendWebhook({
      text: `Violation Alert: ${violation.type}`,
      attachments: [{
        color: violation.severity === 'high' ? 'danger' : 'warning',
        title: `${violation.type} Violation`,
        fields: [
          { title: 'Employee', value: violation.employee, short: true },
          { title: 'Severity', value: violation.severity, short: true },
        ],
      }],
    });
  }
}

export const slack = new SlackClient();
