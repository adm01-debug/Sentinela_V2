# Localization (i18n) Documentation

## Overview

Sentinela supports multiple languages using i18next.

## Supported Languages

| Code | Language |
|------|----------|
| pt-BR | Portuguese (Brazil) |
| en-US | English (US) |
| es-ES | Spanish (Spain) |

## File Structure

```
src/locales/
├── pt-BR.json
├── en-US.json
└── es-ES.json
```

## Usage

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

## Adding a New Language

1. Create a new JSON file in `src/locales/`
2. Copy structure from existing locale
3. Translate all strings
4. Add language to i18n config

## Translation Keys

Use dot notation for nested keys:
```json
{
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar"
  },
  "employees": {
    "title": "Funcionários"
  }
}
```
