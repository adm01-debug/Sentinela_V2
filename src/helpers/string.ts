export const stringHelpers = {
  isEmpty: (str: string): boolean => str.trim().length === 0,
  isEmail: (str: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str),
  isUrl: (str: string): boolean => { try { new URL(str); return true; } catch { return false; } },
  isNumeric: (str: string): boolean => /^\d+$/.test(str),
  reverse: (str: string): string => str.split('').reverse().join(''),
  countWords: (str: string): number => str.trim().split(/\s+/).filter(Boolean).length,
  initials: (str: string): string => str.split(' ').map(w => w[0]).join('').toUpperCase(),
  padStart: (str: string, len: number, char = ' '): string => str.padStart(len, char),
  padEnd: (str: string, len: number, char = ' '): string => str.padEnd(len, char),
};
