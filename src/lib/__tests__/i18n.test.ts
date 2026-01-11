import { describe, it, expect } from 'vitest';
import { defaultLocale, supportedLocales, localeNames } from '../i18n/config';
describe('i18n config', () => {
  it('has default locale', () => { expect(defaultLocale).toBe('en'); });
  it('has supported locales', () => { expect(supportedLocales).toContain('en'); expect(supportedLocales).toContain('pt'); });
  it('has locale names', () => { expect(localeNames.en).toBe('English'); });
});