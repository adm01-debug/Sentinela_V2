import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PolicyCreate from '../PolicyCreate';

describe('PolicyCreate', () => {
  it('renders', () => {
    render(<BrowserRouter><PolicyCreate /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});