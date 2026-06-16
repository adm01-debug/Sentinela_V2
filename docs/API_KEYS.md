# API Keys

Documentation for managing API keys in Sentinela.

## Overview

API keys allow external applications to authenticate with the Sentinela API.

## Creating API Keys

```typescript
import { apiKeyService } from "@/services/apiKeyService";

const { key, apiKey } = await apiKeyService.create("My App", [
  "read:employees",
  "read:screenshots",
]);
// Save the key securely - it won't be shown again!
```

## Scopes

| Scope              | Description             |
| ------------------ | ----------------------- |
| `read:employees`   | Read employee data      |
| `write:employees`  | Create/update employees |
| `read:screenshots` | View screenshots        |
| `read:analytics`   | Access analytics data   |
| `admin`            | Full access             |

## Revoking Keys

```typescript
await apiKeyService.revoke(apiKeyId);
```

## Best Practices

1. Use minimal scopes needed
2. Rotate keys regularly
3. Never commit keys to version control
4. Use environment variables
