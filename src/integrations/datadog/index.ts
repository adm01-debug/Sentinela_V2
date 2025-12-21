interface DatadogConfig { apiKey: string; appKey: string; site?: string; }

class DatadogClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: DatadogConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = \`https://api.\${config.site || 'datadoghq.com'}/api/v1\`;
  }

  async sendMetric(metric: string, value: number, tags?: string[]) {
    const response = await fetch(\`\${this.baseUrl}/series\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'DD-API-KEY': this.apiKey },
      body: JSON.stringify({
        series: [{ metric, points: [[Math.floor(Date.now() / 1000), value]], tags }]
      }),
    });
    return response.ok;
  }

  async sendEvent(title: string, text: string, alertType = 'info') {
    const response = await fetch(\`\${this.baseUrl}/events\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'DD-API-KEY': this.apiKey },
      body: JSON.stringify({ title, text, alert_type: alertType }),
    });
    return response.ok;
  }
}

export const datadog = new DatadogClient({
  apiKey: process.env.DATADOG_API_KEY || '',
  appKey: process.env.DATADOG_APP_KEY || '',
});
