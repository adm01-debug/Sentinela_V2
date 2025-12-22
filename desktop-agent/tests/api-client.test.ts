import { describe, it, expect, vi } from 'vitest';
import * as apiclient from '../src/api-client';

describe('api-client', () => {
  it('module exists', () => {
    expect(apiclient).toBeDefined();
  });
});