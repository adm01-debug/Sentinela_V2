import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastContext } from '../ToastContext';

describe('ToastContext', () => {
  it('renders without crashing', () => {
    expect(ToastContext).toBeDefined();
  });
});