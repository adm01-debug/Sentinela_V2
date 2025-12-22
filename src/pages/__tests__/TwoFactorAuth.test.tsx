import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import TwoFactorAuth from '../TwoFactorAuth';

describe('TwoFactorAuth', () => {
  it('renders', () => {
    render(<BrowserRouter><TwoFactorAuth /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});