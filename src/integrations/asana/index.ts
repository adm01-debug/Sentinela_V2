interface AsanaConfig { accessToken: string; }

class AsanaClient {
  private baseUrl = 'https://app.asana.com/api/1.0';
  constructor(private config: AsanaConfig) {}
  async createTask(projectId: string, name: string) {
    const res = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.config.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { projects: [projectId], name } })
    });
    return res.json();
  }
}

export const asana = new AsanaClient({ accessToken: process.env.ASANA_TOKEN || '' });