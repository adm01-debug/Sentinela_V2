# Changelog

All notable changes to Sentinela will be documented in this file.

## [17.1.0] - 2025-01-12

### Added
- **Tests**: 25+ new component tests (CommandPalette, ToastContainer, DataTable, PermissionGate, GlobalSearch, etc.)
- **E2E Tests**: 5 Playwright test files (auth, dashboard, employees, screenshots, settings)
- **Components**: TimeAgo, CopyButton, UserAvatar, ToastContainer, ConfirmDialog
- **Hooks**: useApiKeys, useBilling, useCommandPalette
- **Services**: apiKeyService, billingService integration
- **Context**: SidebarContext for sidebar state management
- **Constants**: routes.ts, permissions.ts, api.ts with full type definitions
- **Scripts**: check-imports.ts, analyze-bundle.ts for code quality
- **CI/CD**: test.yml, lint.yml workflows
- **Documentation**: I18N.md, PERMISSIONS.md, API_KEYS.md, WEBHOOKS.md, STATE_MANAGEMENT.md
- **i18n**: pt-BR.json and en-US.json translation files

### Improved
- Store tests with comprehensive coverage
- Service tests for API layer
- Hook tests with mocking
- Component barrel file exports

## [17.0.0] - 2025-01-11

### Added
- **Types**: 32 new TypeScript type definitions
- **Stores**: 14 new Zustand stores with devtools and persist
- **Utils**: 12 new utility modules
- **Tests**: Comprehensive test suite for stores and utils

### Architecture
- Full TypeScript strict mode compliance
- Modular store architecture
- Barrel file pattern for exports

[Full changelog available in repository]
