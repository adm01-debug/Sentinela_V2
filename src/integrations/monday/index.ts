interface MondayConfig { apiKey: string; }

class MondayClient {
  constructor(private config: MondayConfig) {}
  async createItem(boardId: string, itemName: string) {
    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: { 'Authorization': this.config.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `mutation { create_item (board_id: ${boardId}, item_name: "${itemName}") { id } }` })
    });
    return res.json();
  }
}

export const monday = new MondayClient({ apiKey: process.env.MONDAY_API_KEY || '' });