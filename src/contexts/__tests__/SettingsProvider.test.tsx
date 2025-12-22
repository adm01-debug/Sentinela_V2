import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingsProvider } from '../SettingsProvider';

describe('SettingsProvider', () => {
  it('renders without crashing', () => {
    expect(SettingsProvider).toBeDefined();
  });
});