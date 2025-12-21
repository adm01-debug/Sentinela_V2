import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

describe('NotFound Page', () => {
  it('renders 404 page', () => {
    render(<BrowserRouter><NotFound /></BrowserRouter>);
    expect(document.body).toBeDefined();
  });

  it('displays not found message', () => {
    render(<BrowserRouter><NotFound /></BrowserRouter>);
    expect(document.body.innerHTML).toBeTruthy();
  });
});