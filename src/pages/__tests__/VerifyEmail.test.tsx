import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import VerifyEmail from '../VerifyEmail';

describe('VerifyEmail', () => {
  it('renders', () => {
    render(<BrowserRouter><VerifyEmail /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});