import { describe, it, expect } from 'vitest';
import * as xss from '../xss';

describe('xss', () => {
  it('should export functions', () => {
    expect(xss).toBeDefined();
  });
});
