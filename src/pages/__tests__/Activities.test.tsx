import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Activities from '../Activities';

describe('Activities', () => {
  it('renders activities page', () => {
    render(<BrowserRouter><Activities /></BrowserRouter>);
    expect(screen.getByText(/activities/i)).toBeInTheDocument();
  });
});