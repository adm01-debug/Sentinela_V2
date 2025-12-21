interface NewRelicConfig { licenseKey: string; accountId: string; }

class NewRelicClient {
  private licenseKey: string;
  private accountId: string;

  constructor(config: NewRelicConfig) {
    this.licenseKey = config.licenseKey;
    this.accountId = config.accountId;
  }

  async sendCustomEvent(eventType: string, attributes: Record<string, unknown>) {
    const response = await fetch(\`https://insights-collector.newrelic.com/v1/accounts/\${this.accountId}/events\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': this.licenseKey },
      body: JSON.stringify([{ eventType, ...attributes }]),
    });
    return response.ok;
  }
}

export const newrelic = new NewRelicClient({
  licenseKey: process.env.NEW_RELIC_LICENSE_KEY || '',
  accountId: process.env.NEW_RELIC_ACCOUNT_ID || '',
});
