import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '@/lib/i18n';

describe('Internationalization (i18n)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  describe('Supported Languages', () => {
    it('has pt-BR translations', () => {
      expect(i18n.hasResourceBundle('pt-BR', 'translation')).toBe(true);
    });

    it('has en-US translations', () => {
      expect(i18n.hasResourceBundle('en-US', 'translation')).toBe(true);
    });

    it('has es translations', () => {
      expect(i18n.hasResourceBundle('es', 'translation')).toBe(true);
    });
  });

  describe('Translation Keys Consistency', () => {
    const ptBR = i18n.getResourceBundle('pt-BR', 'translation');
    const enUS = i18n.getResourceBundle('en-US', 'translation');
    const es = i18n.getResourceBundle('es', 'translation');

    function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
      const keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          keys.push(...getKeys(value as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    }

    const ptKeys = getKeys(ptBR);
    const enKeys = getKeys(enUS);
    const esKeys = getKeys(es);

    it('en-US has all keys from pt-BR', () => {
      const missing = ptKeys.filter(k => !enKeys.includes(k));
      expect(missing).toEqual([]);
    });

    it('es has all keys from pt-BR', () => {
      const missing = ptKeys.filter(k => !esKeys.includes(k));
      expect(missing).toEqual([]);
    });

    it('pt-BR has all keys from en-US', () => {
      const missing = enKeys.filter(k => !ptKeys.includes(k));
      expect(missing).toEqual([]);
    });
  });

  describe('Language Switching', () => {
    it('switches to en-US correctly', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.t('common.save')).toBe('Save');
      expect(i18n.t('nav.dashboard')).toBe('Dashboard');
    });

    it('switches to es correctly', async () => {
      await i18n.changeLanguage('es');
      expect(i18n.t('common.save')).toBe('Guardar');
      expect(i18n.t('nav.employees')).toBe('Empleados');
    });

    it('defaults to pt-BR', () => {
      expect(i18n.t('common.save')).toBe('Salvar');
      expect(i18n.t('nav.employees')).toBe('Funcionários');
    });
  });

  describe('Key Categories Coverage', () => {
    const requiredCategories = ['common', 'nav', 'sections', 'header', 'dashboard', 'employees', 'auth', 'settings', 'errors'];

    requiredCategories.forEach(category => {
      it(`has "${category}" category in pt-BR`, () => {
        const bundle = i18n.getResourceBundle('pt-BR', 'translation');
        expect(bundle).toHaveProperty(category);
        expect(Object.keys(bundle[category]).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation Keys', () => {
    const navKeys = [
      'nav.dashboard', 'nav.employees', 'nav.activities', 'nav.monitoring',
      'nav.alerts', 'nav.reports', 'nav.settings', 'nav.devices',
      'nav.violations', 'nav.teams', 'nav.departments',
    ];

    navKeys.forEach(key => {
      it(`has translation for "${key}" in all languages`, () => {
        ['pt-BR', 'en-US', 'es'].forEach(async (lang) => {
          await i18n.changeLanguage(lang);
          const value = i18n.t(key);
          expect(value).not.toBe(key); // Should not return the key itself
          expect(value.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Header Keys', () => {
    const headerKeys = [
      'header.searchPlaceholder', 'header.notifications', 'header.logout',
      'header.myProfile', 'header.themeLight', 'header.themeDark',
    ];

    headerKeys.forEach(key => {
      it(`has translation for "${key}"`, () => {
        const value = i18n.t(key);
        expect(value).not.toBe(key);
      });
    });
  });

  describe('Minimum Translation Count', () => {
    it('has at least 30 common keys', () => {
      const bundle = i18n.getResourceBundle('pt-BR', 'translation');
      expect(Object.keys(bundle.common).length).toBeGreaterThanOrEqual(30);
    });

    it('has at least 25 nav keys', () => {
      const bundle = i18n.getResourceBundle('pt-BR', 'translation');
      expect(Object.keys(bundle.nav).length).toBeGreaterThanOrEqual(25);
    });

    it('has at least 10 header keys', () => {
      const bundle = i18n.getResourceBundle('pt-BR', 'translation');
      expect(Object.keys(bundle.header).length).toBeGreaterThanOrEqual(10);
    });
  });
});
