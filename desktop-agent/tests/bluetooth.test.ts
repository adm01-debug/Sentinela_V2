import { describe, it, expect, vi } from 'vitest';
import * as bluetooth from '../src/bluetooth';

describe('bluetooth', () => {
  it('module exists', () => {
    expect(bluetooth).toBeDefined();
  });
});