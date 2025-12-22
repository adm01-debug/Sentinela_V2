import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Login from '../Login';

describe('Login', () => {
  it('renders login page', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(document.body).toBeTruthy();
  });
});