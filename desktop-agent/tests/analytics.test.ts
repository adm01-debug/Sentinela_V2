import { describe, it, expect, vi } from 'vitest';
import * as analytics from '../src/analytics';

describe('analytics', () => {
  it('module exists', () => {
    expect(analytics).toBeDefined();
  });
});