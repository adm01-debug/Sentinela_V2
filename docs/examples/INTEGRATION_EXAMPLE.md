# Example: Slack Integration
```typescript
import { SlackClient } from '@/integrations/slack';
const slack = new SlackClient(process.env.SLACK_TOKEN);
// Send alert to Slack
export const sendViolationAlert = async (violation) => {
  await slack.sendMessage({
    channel: '#alerts',
    text: `🚨 Violation detected: ${violation.type}`,
    attachments: [{ color: 'danger', fields: [{ title: 'Employee', value: violation.employeeName }] }]
  });
};
```
