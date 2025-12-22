import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Dashboard from '../Dashboard';

describe('Dashboard', () => {
  it('renders dashboard page', () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});