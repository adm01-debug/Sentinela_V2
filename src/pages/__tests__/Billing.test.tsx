import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Billing from '../Billing';

describe('Billing', () => {
  it('renders billing page', () => {
    render(<BrowserRouter><Billing /></BrowserRouter>);
    expect(screen.getByText(/billing/i)).toBeInTheDocument();
  });
});