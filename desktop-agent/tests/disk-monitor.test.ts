import { describe, it, expect, vi } from 'vitest';
import * as diskmonitor from '../src/disk-monitor';

describe('disk-monitor', () => {
  it('module exists', () => {
    expect(diskmonitor).toBeDefined();
  });
});