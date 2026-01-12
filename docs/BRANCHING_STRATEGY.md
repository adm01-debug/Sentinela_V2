# Branching Strategy

## Overview
Git branching model for Sentinela development.

## Branch Types

| Branch | Purpose | Naming |
|--------|---------|--------|
| main | Production code | main |
| develop | Integration branch | develop |
| feature | New features | feature/JIRA-123-description |
| bugfix | Bug fixes | bugfix/JIRA-123-description |
| hotfix | Emergency fixes | hotfix/JIRA-123-description |
| release | Release preparation | release/18.1.0 |

## Workflow

```
main ────●────────────────●────────────● (releases)
          ╲              ╱
develop ───●────●────●────●────●────●── (integration)
            ╲  ╱    ╲  ╱
feature ────●──●    ●──●                (features)
```

## Branch Rules

### main
- Protected branch
- Requires PR with 2 approvals
- All CI checks must pass
- No direct commits

### develop
- Integration branch
- Requires PR with 1 approval
- All tests must pass

### feature/*
- Created from develop
- Merged back to develop
- Deleted after merge

## Commands
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/JIRA-123-add-feature

# Merge feature
git checkout develop
git merge --no-ff feature/JIRA-123-add-feature
git push origin develop
git branch -d feature/JIRA-123-add-feature
```

## Related Documentation
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)
- [CODE_REVIEW.md](./CODE_REVIEW.md)

