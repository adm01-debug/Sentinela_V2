import { describe, it, expect, vi } from 'vitest';
import * as clipboard from '../src/clipboard';

describe('clipboard', () => {
  it('module exists', () => {
    expect(clipboard).toBeDefined();
  });
});