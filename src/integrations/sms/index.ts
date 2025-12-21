interface SMSConfig { provider: string; apiKey: string; }

class SMSClient {
  constructor(private config: SMSConfig) {}
  async send(to: string, message: string) {
    console.log(`SMS to ${to}: ${message}`);
    return { success: true, to, message };
  }
}

export const sms = new SMSClient({ provider: process.env.SMS_PROVIDER || 'twilio', apiKey: process.env.SMS_API_KEY || '' });