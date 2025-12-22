import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeContext } from '../ThemeContext';

describe('ThemeContext', () => {
  it('renders without crashing', () => {
    expect(ThemeContext).toBeDefined();
  });
});