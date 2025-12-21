interface PipedriveConfig { apiToken: string; }

class PipedriveClient {
  constructor(private config: PipedriveConfig) {}
  async createDeal(title: string, value: number) {
    const res = await fetch(`https://api.pipedrive.com/v1/deals?api_token=${this.config.apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, value })
    });
    return res.json();
  }
}

export const pipedrive = new PipedriveClient({ apiToken: process.env.PIPEDRIVE_API_TOKEN || '' });