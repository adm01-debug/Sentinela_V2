# Internationalization (i18n)

## Overview

Sentinela supports multiple languages using i18next.

## Supported Languages

- English (en) - Default
- Portuguese (pt-BR)
- Spanish (es)

## Setup

```typescript
// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en.json') },
      pt: { translation: require('./locales/pt.json') },
    },
    lng: 'en',
    fallbackLng: 'en',
  });
```

## Translation Files

```
src/locales/
├── en.json
├── pt.json
└── es.json
```

## Using Translations

```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  
  return <h1>{t('dashboard.title')}</h1>;
}
```

## Translation Keys

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome, {{name}}"
  },
  "employees": {
    "list": "Employees",
    "add": "Add Employee"
  }
}
```

## Language Switcher

```tsx
function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="pt">Português</option>
    </select>
  );
}
```

## Adding New Languages

1. Create translation file in `src/locales/`
2. Add language to i18n config
3. Add language option to switcher
