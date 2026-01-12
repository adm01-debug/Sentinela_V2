# Release Process Guide

## Overview
Standard release procedures for Sentinela.

## Release Types

| Type | Frequency | Branch | Example |
|------|-----------|--------|---------|
| Major | Quarterly | main | 18.0.0 |
| Minor | Monthly | main | 18.1.0 |
| Patch | As needed | main | 18.1.1 |
| Hotfix | Emergency | hotfix/* | 18.1.2 |

## Release Checklist

### Pre-Release
- [ ] All tests passing
- [ ] Code review completed
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Documentation updated
- [ ] Security scan passed

### Release
- [ ] Create release branch
- [ ] Run full test suite
- [ ] Build production artifacts
- [ ] Deploy to staging
- [ ] QA verification
- [ ] Create GitHub release
- [ ] Deploy to production

### Post-Release
- [ ] Monitor for issues
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Update documentation site

## Commands
```bash
# Bump version
npm version minor

# Create release
git tag v18.1.0
git push origin v18.1.0

# Build
npm run build

# Deploy
npm run deploy:production
```

## Rollback Procedure
```bash
# Quick rollback
kubectl rollout undo deployment/sentinela-api

# Specific version
kubectl set image deployment/sentinela-api api=sentinela:18.0.0
```

## Related Documentation
- [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md)
- [HOTFIX_GUIDE.md](./HOTFIX_GUIDE.md)

