interface WhatsAppMessage {
  to: string;
  template?: string;
  text?: string;
  parameters?: string[];
}

interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId: string;
}

class WhatsAppClient {
  private apiKey: string;
  private phoneNumberId: string;
  private baseUrl = 'https://graph.facebook.com/v17.0';

  constructor(config?: WhatsAppConfig) {
    this.apiKey = config?.apiKey || process.env.WHATSAPP_API_KEY || '';
    this.phoneNumberId = config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendTemplate(to: string, template: string, parameters: string[] = []): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'template',
          template: {
            name: template,
            language: { code: 'pt_BR' },
            components: parameters.length > 0 ? [{
              type: 'body',
              parameters: parameters.map(p => ({ type: 'text', text: p })),
            }] : undefined,
          },
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('WhatsApp send failed:', error);
      return false;
    }
  }

  async sendText(to: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: text },
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('WhatsApp send failed:', error);
      return false;
    }
  }
}

export const whatsapp = new WhatsAppClient();
