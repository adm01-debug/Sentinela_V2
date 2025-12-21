# Changelog Guide

## Overview

This guide explains how to maintain the CHANGELOG.md file.

## Format

We follow [Keep a Changelog](https://keepachangelog.com/) format.

## Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

## Example Entry

```markdown
## [1.2.0] - 2024-01-15

### Added
- New employee dashboard with real-time stats
- PDF export for violation reports

### Changed
- Improved performance of activity charts
- Updated UI for mobile responsiveness

### Fixed
- Fixed timezone issues in scheduled reports
- Resolved memory leak in live monitoring
```

## Commit Messages

Use conventional commits:
- `feat:` → Added
- `fix:` → Fixed
- `docs:` → Documentation
- `refactor:` → Changed
- `perf:` → Changed (performance)
- `security:` → Security

## Automation

Changelog is auto-generated from commits:
```bash
npm run changelog
```

## Versioning

We use Semantic Versioning:
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes
