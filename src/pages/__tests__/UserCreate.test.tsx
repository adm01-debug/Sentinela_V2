import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import UserCreate from '../UserCreate';

describe('UserCreate', () => {
  it('renders', () => {
    render(<BrowserRouter><UserCreate /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});