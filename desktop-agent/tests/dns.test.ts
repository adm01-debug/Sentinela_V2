import { describe, it, expect, vi } from 'vitest';
import * as dns from '../src/dns';

describe('dns', () => {
  it('module exists', () => {
    expect(dns).toBeDefined();
  });
});