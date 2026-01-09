# API Reference

## Supabase Client

```typescript
import { supabase } from '@/integrations/supabase/client';

// Query data
const { data, error } = await supabase
  .from('employees')
  .select('*');

// Insert data
const { data, error } = await supabase
  .from('employees')
  .insert({ name: 'John' });
```

## Edge Functions

### Authentication
- `POST /functions/v1/refresh-tokens` - Refresh auth tokens
- `POST /functions/v1/verify-email` - Verify email address

### Employees
- `POST /functions/v1/sync-employee` - Sync employee data
- `POST /functions/v1/import-employees` - Bulk import

### Reports
- `POST /functions/v1/generate-report` - Generate report
- `POST /functions/v1/send-scheduled-report` - Send scheduled

### Notifications
- `POST /functions/v1/send-email-notification` - Email
- `POST /functions/v1/send-push-notification` - Push
- `POST /functions/v1/send-slack-notification` - Slack
- `POST /functions/v1/send-whatsapp` - WhatsApp

### AI Features
- `POST /functions/v1/analyze-activity` - Analyze activity
- `POST /functions/v1/predict-anomaly` - Predict anomalies
- `POST /functions/v1/generate-insights` - Generate insights
