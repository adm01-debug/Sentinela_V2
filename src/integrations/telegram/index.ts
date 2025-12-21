interface TelegramConfig { botToken: string; }

class TelegramClient {
  constructor(private config: TelegramConfig) {}
  async sendMessage(chatId: string, text: string) {
    const res = await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    return res.json();
  }
}

export const telegram = new TelegramClient({ botToken: process.env.TELEGRAM_BOT_TOKEN || '' });