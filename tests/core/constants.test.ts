import { DEFAULT_TIMEOUT_MS, ERROR_CODES, LOG_LEVELS } from '../../core/constants';

describe('Core Constants', () => {
  it('should have timeout constant', () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(30000);
  });

  it('should have error codes', () => {
    expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND');
  });

  it('should have log levels', () => {
    expect(LOG_LEVELS.DEBUG).toBe(0);
    expect(LOG_LEVELS.FATAL).toBe(4);
  });
});
