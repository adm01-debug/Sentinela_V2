interface TrelloConfig { apiKey: string; token: string; }

class TrelloClient {
  constructor(private config: TrelloConfig) {}
  async createCard(listId: string, name: string, desc?: string) {
    const res = await fetch(`https://api.trello.com/1/cards?key=${this.config.apiKey}&token=${this.config.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idList: listId, name, desc })
    });
    return res.json();
  }
}

export const trello = new TrelloClient({ apiKey: process.env.TRELLO_API_KEY || '', token: process.env.TRELLO_TOKEN || '' });