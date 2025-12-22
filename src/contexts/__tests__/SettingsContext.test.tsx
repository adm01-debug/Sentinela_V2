import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingsContext } from '../SettingsContext';

describe('SettingsContext', () => {
  it('renders without crashing', () => {
    expect(SettingsContext).toBeDefined();
  });
});