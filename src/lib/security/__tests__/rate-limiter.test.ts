import { describe, it, expect } from 'vitest';
import * as ratelimiter from '../rate-limiter';

describe('rate-limiter', () => {
  it('should export functions', () => {
    expect(ratelimiter).toBeDefined();
  });
});
