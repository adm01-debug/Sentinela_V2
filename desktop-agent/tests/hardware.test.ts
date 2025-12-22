import { describe, it, expect, vi } from 'vitest';
import * as hardware from '../src/hardware';

describe('hardware', () => {
  it('module exists', () => {
    expect(hardware).toBeDefined();
  });
});