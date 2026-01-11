export class NotionClient {
  private apiKey: string;
  private baseUrl = 'https://api.notion.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async getDatabase(databaseId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/databases/${databaseId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Notion-Version': '2022-06-28' }
    });
    return res.json();
  }
  
  async createPage(databaseId: string, properties: Record<string, any>): Promise<any> {
    const res = await fetch(`${this.baseUrl}/pages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ parent: { database_id: databaseId }, properties })
    });
    return res.json();
  }
}
