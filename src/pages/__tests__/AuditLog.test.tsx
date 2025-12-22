import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AuditLog from '../AuditLog';

describe('AuditLog', () => {
  it('renders audit log page', () => {
    render(<BrowserRouter><AuditLog /></BrowserRouter>);
    expect(screen.getByText(/audit/i)).toBeInTheDocument();
  });
});