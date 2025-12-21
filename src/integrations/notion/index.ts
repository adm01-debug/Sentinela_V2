interface NotionConfig { apiKey: string; }

class NotionClient {
  constructor(private config: NotionConfig) {}
  async createPage(parentId: string, title: string) {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.config.apiKey}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ parent: { database_id: parentId }, properties: { title: { title: [{ text: { content: title } }] } } })
    });
    return res.json();
  }
}

export const notion = new NotionClient({ apiKey: process.env.NOTION_API_KEY || '' });