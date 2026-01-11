# Changelog

All notable changes to Sentinela will be documented in this file.

## [17.0.0] - 2026-01-11

### Added
- **Types (32 files)**: Comprehensive TypeScript type definitions
  - Core entities: user, team, department, project, screenshot, notification, auditLog, integration
  - System types: billing, subscription, webhook, apiKey, permission, role, session, device
  - Content types: application, category, tag, comment, attachment, export, import, filter
  - UI types: sort, pagination, common, form, table, chart

- **Stores (14 new)**: Zustand state management stores
  - projectStore, screenshotStore, analyticsStore, billingStore, integrationStore
  - auditStore, modalStore, toastStore, sidebarStore, breadcrumbStore
  - commandStore, searchStore, selectionStore, clipboardStore

- **Utils (12 new)**: Utility functions
  - url, query, file, image, hash, random, sleep, retry, memoize, deepClone
  - currency, duration

- **Tests**: Comprehensive test coverage
  - Store tests: analytics, billing, integration, sidebar, command, selection
  - Utils tests: url, retry, memoize, currency

### Changed
- Updated all barrel files (index.ts) for types, stores, and utils
- Improved type safety across the application
- Enhanced state management patterns

### Technical
- Full TypeScript coverage with strict mode
- Zustand stores with devtools and persist middleware
- Comprehensive utility functions for common operations

## [16.0.0] - 2025-12-XX

### Added
- Previous version features...

## [15.0.0] - 2025-11-XX

### Added
- Previous version features...

---

For more details, see the [commit history](https://github.com/adm01-debug/sentinela/commits/main).
