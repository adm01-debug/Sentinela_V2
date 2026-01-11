export class GitHubClient {
  private token: string;
  private baseUrl = 'https://api.github.com';
  
  constructor(token: string) {
    this.token = token;
  }
  
  async createIssue(owner: string, repo: string, title: string, body: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: { Authorization: `token ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
    return res.json();
  }
  
  async getIssues(owner: string, repo: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
      headers: { Authorization: `token ${this.token}` }
    });
    return res.json();
  }
}
