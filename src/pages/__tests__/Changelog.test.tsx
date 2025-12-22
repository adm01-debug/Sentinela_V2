import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Changelog from '../Changelog';

describe('Changelog', () => {
  it('renders changelog page', () => {
    render(<BrowserRouter><Changelog /></BrowserRouter>);
    expect(screen.getByText(/changelog/i)).toBeInTheDocument();
  });
});