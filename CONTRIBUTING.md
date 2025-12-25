# Contributing to Sentinela

Thank you for your interest in contributing to Sentinela! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/adm01-debug/sentinela/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Follow the commit message convention
7. Push and create a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/sentinela.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Adding tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `chore:` - Maintenance

Example: `feat(cqrs): add query caching support`

## Code Style

- Use TypeScript strict mode
- Add JSDoc comments to public APIs
- Follow existing patterns in the codebase
- Keep functions small and focused

## Testing

- Write unit tests for all new code
- Maintain minimum 80% code coverage
- Use descriptive test names

## Questions?

Feel free to open a discussion or reach out to maintainers.

Thank you for contributing! 🎉
