import { describe, it, expect, vi } from 'vitest';
import * as hotkeys from '../src/hotkeys';

describe('hotkeys', () => {
  it('module exists', () => {
    expect(hotkeys).toBeDefined();
  });
});