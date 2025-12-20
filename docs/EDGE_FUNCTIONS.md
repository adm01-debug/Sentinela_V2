# Edge Functions Documentation

## Overview

Sentinela uses Supabase Edge Functions for serverless backend operations.

## Available Functions

| Function | Purpose |
|----------|---------|
| agent-collector | Collect data from desktop agents |
| analyze-activity | AI-powered activity analysis |
| check-geofence | Verify employee location |
| cleanup-rate-limit-logs | Cleanup old rate limit logs |
| create-monthly-partitions | Create database partitions |
| get-employee-schedule | Retrieve employee schedules |
| get-mapbox-token | Get Mapbox API token |
| get-policies | Fetch monitoring policies |
| health-check | System health check |
| mobile-collector | Collect data from mobile app |
| ocr-screenshot | Extract text from screenshots |
| process-violation-alert | Process and send violation alerts |
| request-overtime | Handle overtime requests |
| send-push-notification | Send push notifications |
| send-rate-limit-alert | Send rate limit alerts |
| send-scheduled-report | Generate and send reports |
| send-webhook | Trigger external webhooks |
| send-whatsapp | Send WhatsApp messages |

## Deployment

```bash
# Deploy all functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy agent-collector
```

## Testing

```bash
# Run tests
deno test --allow-all

# Test specific function
curl -X POST https://your-project.supabase.co/functions/v1/health-check
```
