interface ConfluenceConfig { baseUrl: string; email: string; apiToken: string; }

class ConfluenceClient {
  constructor(private config: ConfluenceConfig) {}
  async createPage(spaceKey: string, title: string, content: string) {
    const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
    const res = await fetch(`${this.config.baseUrl}/wiki/rest/api/content`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page', title, space: { key: spaceKey }, body: { storage: { value: content, representation: 'storage' } } })
    });
    return res.json();
  }
}

export const confluence = new ConfluenceClient({ baseUrl: process.env.CONFLUENCE_URL || '', email: process.env.CONFLUENCE_EMAIL || '', apiToken: process.env.CONFLUENCE_TOKEN || '' });