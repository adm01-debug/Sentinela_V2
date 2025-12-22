import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserProvider } from '../UserProvider';

describe('UserProvider', () => {
  it('renders without crashing', () => {
    expect(UserProvider).toBeDefined();
  });
});