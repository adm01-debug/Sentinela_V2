import { describe, it, expect, vi } from 'vitest';
import * as firewall from '../src/firewall';

describe('firewall', () => {
  it('module exists', () => {
    expect(firewall).toBeDefined();
  });
});