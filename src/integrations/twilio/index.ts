interface TwilioConfig { accountSid: string; authToken: string; fromNumber: string; }

class TwilioClient {
  private config: TwilioConfig;
  private baseUrl: string;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.baseUrl = \`https://api.twilio.com/2010-04-01/Accounts/\${config.accountSid}\`;
  }

  async sendSMS(to: string, body: string) {
    const auth = btoa(\`\${this.config.accountSid}:\${this.config.authToken}\`);
    const response = await fetch(\`\${this.baseUrl}/Messages.json\`, {
      method: 'POST',
      headers: { 'Authorization': \`Basic \${auth}\`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: to, From: this.config.fromNumber, Body: body }),
    });
    return response.json();
  }
}

export const twilio = new TwilioClient({
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  fromNumber: process.env.TWILIO_FROM_NUMBER || '',
});
