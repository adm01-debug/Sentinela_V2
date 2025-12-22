import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Error from '../Error';

describe('Error', () => {
  it('renders error page', () => {
    render(<BrowserRouter><Error /></BrowserRouter>);
    expect(screen.getByText(/error|oops/i)).toBeInTheDocument();
  });
});