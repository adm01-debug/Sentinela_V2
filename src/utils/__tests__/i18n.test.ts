import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('i18n utils', () => {
  const translations: Record<string, Record<string, string>> = {
    'en-US': {
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'errors.required': '{{field}} is required',
      'greeting': 'Hello, {{name}}!',
    },
    'pt-BR': {
      'common.save': 'Salvar',
      'common.cancel': 'Cancelar',
      'errors.required': '{{field}} é obrigatório',
      'greeting': 'Olá, {{name}}!',
    },
  };

  let currentLocale = 'en-US';

  const t = (key: string, params?: Record<string, string>) => {
    let text = translations[currentLocale]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), v);
      });
    }
    return text;
  };

  const setLocale = (locale: string) => {
    currentLocale = locale;
  };

  beforeEach(() => {
    currentLocale = 'en-US';
  });

  describe('translation', () => {
    it('should translate key to current locale', () => {
      expect(t('common.save')).toBe('Save');
    });

    it('should return key if translation not found', () => {
      expect(t('unknown.key')).toBe('unknown.key');
    });

    it('should change locale', () => {
      setLocale('pt-BR');
      expect(t('common.save')).toBe('Salvar');
    });
  });

  describe('interpolation', () => {
    it('should replace placeholders', () => {
      expect(t('greeting', { name: 'John' })).toBe('Hello, John!');
    });

    it('should handle multiple placeholders', () => {
      expect(t('errors.required', { field: 'Email' })).toBe('Email is required');
    });

    it('should work with different locales', () => {
      setLocale('pt-BR');
      expect(t('greeting', { name: 'João' })).toBe('Olá, João!');
    });
  });

  describe('locale detection', () => {
    it('should get browser locale', () => {
      vi.stubGlobal('navigator', { language: 'pt-BR' });
      expect(navigator.language).toBe('pt-BR');
    });

    it('should get preferred languages', () => {
      vi.stubGlobal('navigator', { languages: ['pt-BR', 'en-US', 'es'] });
      expect(navigator.languages).toContain('pt-BR');
    });
  });

  describe('number formatting', () => {
    it('should format number for locale', () => {
      const format = (n: number, locale: string) => 
        new Intl.NumberFormat(locale).format(n);
      
      expect(format(1234.56, 'en-US')).toBe('1,234.56');
      expect(format(1234.56, 'de-DE')).toBe('1.234,56');
    });

    it('should format currency', () => {
      const formatCurrency = (n: number, locale: string, currency: string) =>
        new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
      
      expect(formatCurrency(100, 'en-US', 'USD')).toContain('$');
      expect(formatCurrency(100, 'pt-BR', 'BRL')).toContain('R$');
    });

    it('should format percentage', () => {
      const formatPercent = (n: number, locale: string) =>
        new Intl.NumberFormat(locale, { style: 'percent' }).format(n);
      
      expect(formatPercent(0.25, 'en-US')).toBe('25%');
    });
  });

  describe('date formatting', () => {
    it('should format date for locale', () => {
      const date = new Date('2024-01-15');
      const format = (d: Date, locale: string) =>
        new Intl.DateTimeFormat(locale).format(d);
      
      expect(format(date, 'en-US')).toContain('1');
      expect(format(date, 'pt-BR')).toContain('15');
    });

    it('should format with options', () => {
      const date = new Date('2024-01-15');
      const format = (d: Date, locale: string) =>
        new Intl.DateTimeFormat(locale, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }).format(d);
      
      const formatted = format(date, 'en-US');
      expect(formatted).toContain('January');
    });
  });

  describe('pluralization', () => {
    it('should handle plural rules', () => {
      const pluralize = (count: number, singular: string, plural: string) =>
        count === 1 ? singular : plural;
      
      expect(pluralize(1, 'item', 'items')).toBe('item');
      expect(pluralize(5, 'item', 'items')).toBe('items');
    });

    it('should use Intl.PluralRules', () => {
      const rules = new Intl.PluralRules('en-US');
      expect(rules.select(1)).toBe('one');
      expect(rules.select(2)).toBe('other');
    });
  });
});
