import { describe, it, expect } from 'vitest';
import * as encryption from '../encryption';

describe('encryption', () => {
  it('should export functions', () => {
    expect(encryption).toBeDefined();
  });
});
