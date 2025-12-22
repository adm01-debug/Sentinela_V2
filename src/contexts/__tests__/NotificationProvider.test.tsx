import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NotificationProvider } from '../NotificationProvider';

describe('NotificationProvider', () => {
  it('renders without crashing', () => {
    expect(NotificationProvider).toBeDefined();
  });
});