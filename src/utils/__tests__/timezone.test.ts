import { describe, it, expect } from 'vitest';
import { getLocalTimezone, getTimezoneOffset, formatTimezoneOffset, isValidTimezone } from '../timezone';

describe('timezone utilities', () => {
  it('should get local timezone', () => {
    const tz = getLocalTimezone();
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
  });

  it('should get timezone offset', () => {
    const offset = getTimezoneOffset('America/Sao_Paulo');
    expect(typeof offset).toBe('number');
  });

  it('should format timezone offset', () => {
    expect(formatTimezoneOffset(-180)).toBe('-03:00');
    expect(formatTimezoneOffset(60)).toBe('+01:00');
  });

  it('should validate timezone', () => {
    expect(isValidTimezone('America/Sao_Paulo')).toBe(true);
    expect(isValidTimezone('Invalid/Timezone')).toBe(false);
  });
});
