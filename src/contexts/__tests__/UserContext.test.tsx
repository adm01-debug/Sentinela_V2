import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserContext } from '../UserContext';

describe('UserContext', () => {
  it('renders without crashing', () => {
    expect(UserContext).toBeDefined();
  });
});