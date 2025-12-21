interface SegmentConfig { writeKey: string; }

class SegmentClient {
  private writeKey: string;
  private baseUrl = 'https://api.segment.io/v1';

  constructor(config: SegmentConfig) { this.writeKey = config.writeKey; }

  private async send(type: string, payload: Record<string, unknown>) {
    const response = await fetch(\`\${this.baseUrl}/\${type}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Basic \${btoa(this.writeKey + ':')}\` },
      body: JSON.stringify(payload),
    });
    return response.ok;
  }

  async identify(userId: string, traits?: Record<string, unknown>) {
    return this.send('identify', { userId, traits });
  }

  async track(userId: string, event: string, properties?: Record<string, unknown>) {
    return this.send('track', { userId, event, properties });
  }

  async page(userId: string, name: string, properties?: Record<string, unknown>) {
    return this.send('page', { userId, name, properties });
  }
}

export const segment = new SegmentClient({ writeKey: process.env.SEGMENT_WRITE_KEY || '' });
