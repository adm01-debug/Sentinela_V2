# Code Review Guide

## Overview
Code review standards and best practices.

## Review Checklist

### General
- [ ] Code follows style guide
- [ ] No console.log or debug code
- [ ] Meaningful variable names
- [ ] No hardcoded values
- [ ] Proper error handling

### Security
- [ ] Input validation
- [ ] No sensitive data in logs
- [ ] Proper authentication checks
- [ ] SQL injection prevention
- [ ] XSS prevention

### Performance
- [ ] No N+1 queries
- [ ] Proper indexing
- [ ] Efficient algorithms
- [ ] Memory leak prevention
- [ ] Caching where appropriate

### Testing
- [ ] Unit tests added
- [ ] Integration tests if needed
- [ ] Edge cases covered
- [ ] Test coverage maintained

### Documentation
- [ ] JSDoc comments for public APIs
- [ ] README updated if needed
- [ ] Changelog entry
- [ ] API documentation

## Review Process
1. Author creates PR with description
2. Automated checks run (CI/CD)
3. At least one reviewer assigned
4. Reviewer provides feedback
5. Author addresses comments
6. Approval and merge

## PR Template
```markdown
## Description
[What does this PR do?]

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Testing
[How was this tested?]

## Checklist
- [ ] Tests added
- [ ] Documentation updated
- [ ] No breaking changes
```

## Related Documentation
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md)

