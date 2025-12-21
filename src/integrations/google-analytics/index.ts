interface GAConfig { measurementId: string; apiSecret: string; }

class GoogleAnalyticsClient {
  constructor(private config: GAConfig) {}
  async trackEvent(clientId: string, name: string, params?: Record<string, unknown>) {
    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${this.config.measurementId}&api_secret=${this.config.apiSecret}`, {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, events: [{ name, params }] })
    });
  }
}

export const googleAnalytics = new GoogleAnalyticsClient({ measurementId: process.env.GA_MEASUREMENT_ID || '', apiSecret: process.env.GA_API_SECRET || '' });