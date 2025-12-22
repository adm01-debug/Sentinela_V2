import { describe, it, expect, vi } from 'vitest';
import * as crashreporter from '../src/crash-reporter';

describe('crash-reporter', () => {
  it('module exists', () => {
    expect(crashreporter).toBeDefined();
  });
});