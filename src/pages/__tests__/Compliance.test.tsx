import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Compliance from '../Compliance';

describe('Compliance', () => {
  it('renders compliance page', () => {
    render(<BrowserRouter><Compliance /></BrowserRouter>);
    expect(screen.getByText(/compliance/i)).toBeInTheDocument();
  });
});