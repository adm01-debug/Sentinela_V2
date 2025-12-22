import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Register from '../Register';

describe('Register', () => {
  it('renders', () => {
    render(<BrowserRouter><Register /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});