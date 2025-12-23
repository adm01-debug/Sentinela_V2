export const stringHelpers = {
  isEmpty: (str: string): boolean => str.trim().length === 0,
  isEmail: (str: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str),
  isUrl: (str: string): boolean => { try { new URL(str); return true; } catch { return false; } },
  isUUID: (str: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str),
  padStart: (str: string, length: number, char = '0'): string => str.padStart(length, char),
  padEnd: (str: string, length: number, char = ' '): string => str.padEnd(length, char),
  reverse: (str: string): string => str.split('').reverse().join(''),
  countWords: (str: string): number => str.trim().split(/\s+/).filter(Boolean).length,
  initials: (name: string): string => name.split(' ').map(n => n[0]).join('').toUpperCase(),
};
