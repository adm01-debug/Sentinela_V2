import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Backup from '../Backup';

describe('Backup', () => {
  it('renders backup page', () => {
    render(<BrowserRouter><Backup /></BrowserRouter>);
    expect(screen.getByText(/backup/i)).toBeInTheDocument();
  });
});