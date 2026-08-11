import { describe, it, expect } from 'vitest';
import { formatShortcutKey, groupShortcuts, type KeyboardShortcut } from '@/hooks/useGlobalShortcuts';
import { injectStructuredData } from '@/lib/structuredData';

describe('formatShortcutKey', () => {
  it('formats simple key', () => {
    const s: KeyboardShortcut = { key: 'd', description: '', category: '', action: () => {} };
    expect(formatShortcutKey(s)).toBe('D');
  });

  it('formats alt combo', () => {
    const s: KeyboardShortcut = { key: 'd', alt: true, description: '', category: '', action: () => {} };
    expect(formatShortcutKey(s)).toBe('Alt + D');
  });

  it('formats ctrl+shift combo', () => {
    const s: KeyboardShortcut = { key: 'k', ctrl: true, shift: true, description: '', category: '', action: () => {} };
    expect(formatShortcutKey(s)).toBe('Ctrl + Shift + K');
  });
});

describe('groupShortcuts', () => {
  it('groups by category', () => {
    const shortcuts: KeyboardShortcut[] = [
      { key: 'a', description: 'A', category: 'Nav', action: () => {} },
      { key: 'b', description: 'B', category: 'Nav', action: () => {} },
      { key: 'c', description: 'C', category: 'Actions', action: () => {} },
    ];
    const grouped = groupShortcuts(shortcuts);
    expect(Object.keys(grouped)).toEqual(['Nav', 'Actions']);
    expect(grouped['Nav'].length).toBe(2);
    expect(grouped['Actions'].length).toBe(1);
  });

  it('handles empty array', () => {
    expect(Object.keys(groupShortcuts([])).length).toBe(0);
  });
});

describe('structuredData', () => {
  it('injects JSON-LD script into head', () => {
    injectStructuredData();
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent || '{}');
    expect(data['@type']).toBe('WebApplication');
    expect(data.name).toContain('Sentinela');
  });

  it('injects OG meta tags', () => {
    injectStructuredData();
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle).not.toBeNull();
    expect(ogTitle?.getAttribute('content')).toContain('Sentinela');
  });

  it('is idempotent (does not duplicate)', () => {
    injectStructuredData();
    injectStructuredData();
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
  });
});
