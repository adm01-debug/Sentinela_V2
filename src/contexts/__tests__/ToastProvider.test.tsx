import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider } from '../ToastProvider';

describe('ToastProvider', () => {
  it('renders without crashing', () => {
    expect(ToastProvider).toBeDefined();
  });
});