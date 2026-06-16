# Hotfix Guide

## Overview

Emergency fix procedures for production issues.

## When to Use Hotfix

- Critical security vulnerability
- Production-breaking bug
- Data corruption risk
- Major functionality failure

## Hotfix Process

### 1. Create Hotfix Branch

```bash
git checkout main
git pull origin main
git checkout -b hotfix/JIRA-123-critical-fix
```

### 2. Implement Fix

- Minimal changes only
- Focus on the specific issue
- Add regression tests

### 3. Test

```bash
npm test
npm run test:e2e
```

### 4. Review

- Expedited review process
- Security team review if applicable
- QA verification on staging

### 5. Deploy

```bash
# Merge to main
git checkout main
git merge --no-ff hotfix/JIRA-123-critical-fix
git tag v18.1.1

# Deploy immediately
npm run deploy:production

# Merge back to develop
git checkout develop
git merge main
```

### 6. Post-Hotfix

- Monitor production closely
- Update incident report
- Schedule post-mortem

## Approval Matrix

| Severity | Approvers Required |
| -------- | ------------------ |
| SEV1     | 1 (any senior dev) |
| SEV2     | 2 (including lead) |

## Related Documentation

- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)
