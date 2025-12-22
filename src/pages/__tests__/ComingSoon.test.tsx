import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ComingSoon from '../ComingSoon';

describe('ComingSoon', () => {
  it('renders coming soon page', () => {
    render(<BrowserRouter><ComingSoon /></BrowserRouter>);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});