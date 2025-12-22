import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Analytics from '../Analytics';

describe('Analytics', () => {
  it('renders analytics page', () => {
    render(<BrowserRouter><Analytics /></BrowserRouter>);
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });
});