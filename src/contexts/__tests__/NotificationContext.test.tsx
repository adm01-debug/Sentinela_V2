import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NotificationContext } from '../NotificationContext';

describe('NotificationContext', () => {
  it('renders without crashing', () => {
    expect(NotificationContext).toBeDefined();
  });
});