import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ApiKeys from '../ApiKeys';

describe('ApiKeys', () => {
  it('renders api keys page', () => {
    render(<BrowserRouter><ApiKeys /></BrowserRouter>);
    expect(screen.getByText(/api/i)).toBeInTheDocument();
  });
});