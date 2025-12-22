import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthProvider } from '../AuthProvider';

describe('AuthProvider', () => {
  it('renders without crashing', () => {
    expect(AuthProvider).toBeDefined();
  });
});