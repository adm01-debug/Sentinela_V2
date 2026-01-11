export class TeamsClient {
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  
  async sendMessage(channelId: string, message: string): Promise<void> {
    await fetch(`https://graph.microsoft.com/v1.0/teams/${channelId}/channels/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: { content: message } })
    });
  }
  
  async getChannels(teamId: string): Promise<any[]> {
    const res = await fetch(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    const data = await res.json();
    return data.value || [];
  }
}
