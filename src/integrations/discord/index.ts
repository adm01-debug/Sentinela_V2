interface DiscordEmbed { title?: string; description?: string; color?: number; fields?: { name: string; value: string }[]; }

class DiscordClient {
  private webhookUrl: string;

  constructor(webhookUrl: string) { this.webhookUrl = webhookUrl; }

  async sendMessage(content: string, embeds?: DiscordEmbed[]) {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, embeds }),
    });
    return response.ok;
  }

  async sendAlert(title: string, message: string, severity: 'info' | 'warning' | 'error') {
    const colors = { info: 0x3498db, warning: 0xf39c12, error: 0xe74c3c };
    return this.sendMessage('', [{ title, description: message, color: colors[severity] }]);
  }
}

export const discord = new DiscordClient(process.env.DISCORD_WEBHOOK_URL || '');
