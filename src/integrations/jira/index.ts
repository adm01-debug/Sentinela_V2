interface JiraConfig { baseUrl: string; email: string; token: string; }

class JiraClient {
  private baseUrl: string;
  private auth: string;

  constructor(config: JiraConfig) {
    this.baseUrl = config.baseUrl;
    this.auth = btoa(\`\${config.email}:\${config.token}\`);
  }

  async createIssue(projectKey: string, summary: string, issueType = 'Task') {
    const response = await fetch(\`\${this.baseUrl}/rest/api/3/issue\`, {
      method: 'POST',
      headers: { 'Authorization': \`Basic \${this.auth}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: { project: { key: projectKey }, summary, issuetype: { name: issueType } }
      }),
    });
    return response.json();
  }

  async getIssue(issueKey: string) {
    const response = await fetch(\`\${this.baseUrl}/rest/api/3/issue/\${issueKey}\`, {
      headers: { 'Authorization': \`Basic \${this.auth}\` },
    });
    return response.json();
  }
}

export const jira = new JiraClient({
  baseUrl: process.env.JIRA_BASE_URL || '',
  email: process.env.JIRA_EMAIL || '',
  token: process.env.JIRA_TOKEN || '',
});
