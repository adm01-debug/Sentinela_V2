import { describe, it, expect } from 'vitest';
import { assignVariant } from '../ab-testing';

describe('A/B Testing', () => {
  it('should assign variant', () => {
    const variant = assignVariant({ id: 'test', name: 'test', variants: ['a', 'b'] }, 'user1');
    expect(['a', 'b']).toContain(variant);
  });
});
