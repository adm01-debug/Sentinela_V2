# API Versioning Guide

## Overview
API versioning strategy and deprecation policy.

## Versioning Strategy

### URL Path Versioning
```
https://api.sentinela.app/v1/users
https://api.sentinela.app/v2/users
```

### Current Versions
| Version | Status | Sunset Date |
|---------|--------|-------------|
| v1 | Deprecated | 2025-06-01 |
| v2 | Current | - |
| v3 | Beta | - |

## Version Lifecycle

1. **Beta**: Testing and feedback
2. **Current**: Production stable
3. **Deprecated**: 6 months notice
4. **Sunset**: No longer available

## Breaking Changes

### What Requires New Version
- Removing endpoints
- Changing response structure
- Changing required parameters
- Changing authentication

### What Does NOT Require New Version
- Adding new endpoints
- Adding optional parameters
- Adding response fields
- Performance improvements

## Migration Guide

### v1 to v2 Changes
```typescript
// v1 (deprecated)
GET /v1/users/:id
Response: { user: { id, name, email } }

// v2 (current)
GET /v2/users/:id
Response: { data: { id, name, email }, meta: { ... } }
```

## Deprecation Notices
```json
{
  "data": { ... },
  "meta": {
    "deprecation": {
      "warning": "This endpoint is deprecated",
      "sunset": "2025-06-01",
      "migration": "https://docs.sentinela.app/migration/v2"
    }
  }
}
```

## Related Documentation
- [API.md](./API.md)
- [API_REFERENCE.md](./API_REFERENCE.md)

