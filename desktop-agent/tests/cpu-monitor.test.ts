import { describe, it, expect, vi } from 'vitest';
import * as cpumonitor from '../src/cpu-monitor';

describe('cpu-monitor', () => {
  it('module exists', () => {
    expect(cpumonitor).toBeDefined();
  });
});