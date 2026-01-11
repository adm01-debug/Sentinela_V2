export class JiraClient {
  private baseUrl: string;
  private auth: string;
  
  constructor(config: { domain: string; email: string; apiToken: string }) {
    this.baseUrl = `https://${config.domain}.atlassian.net/rest/api/3`;
    this.auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
  }
  
  async createIssue(projectKey: string, summary: string, description: string, issueType: string = 'Task'): Promise<any> {
    const res = await fetch(`${this.baseUrl}/issue`, {
      method: 'POST',
      headers: { Authorization: `Basic ${this.auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { project: { key: projectKey }, summary, description, issuetype: { name: issueType } } })
    });
    return res.json();
  }
  
  async getIssues(projectKey: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/search?jql=project=${projectKey}`, {
      headers: { Authorization: `Basic ${this.auth}` }
    });
    const data = await res.json();
    return data.issues || [];
  }
}
