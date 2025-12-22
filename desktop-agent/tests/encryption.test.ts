import { describe, it, expect, vi } from 'vitest';
import * as encryption from '../src/encryption';

describe('encryption', () => {
  it('module exists', () => {
    expect(encryption).toBeDefined();
  });
});