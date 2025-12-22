import { describe, it, expect, vi } from 'vitest';
import * as eventbus from '../src/event-bus';

describe('event-bus', () => {
  it('module exists', () => {
    expect(eventbus).toBeDefined();
  });
});