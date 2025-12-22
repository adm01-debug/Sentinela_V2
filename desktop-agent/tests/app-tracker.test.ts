import { describe, it, expect, vi } from 'vitest';
import * as apptracker from '../src/app-tracker';

describe('app-tracker', () => {
  it('module exists', () => {
    expect(apptracker).toBeDefined();
  });
});