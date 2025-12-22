import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import BillingSettings from '../BillingSettings';

describe('BillingSettings', () => {
  it('renders billing settings page', () => {
    render(<BrowserRouter><BillingSettings /></BrowserRouter>);
    expect(screen.getByText(/billing/i)).toBeInTheDocument();
  });
});