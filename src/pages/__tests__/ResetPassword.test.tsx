import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ResetPassword from '../ResetPassword';

describe('ResetPassword', () => {
  it('renders', () => {
    render(<BrowserRouter><ResetPassword /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});