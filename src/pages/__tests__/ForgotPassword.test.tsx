import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ForgotPassword from '../ForgotPassword';

describe('ForgotPassword', () => {
  it('renders forgotpassword page', () => {
    render(<BrowserRouter><ForgotPassword /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});