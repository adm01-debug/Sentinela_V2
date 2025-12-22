import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EmployeeExport from '../EmployeeExport';

describe('EmployeeExport', () => {
  it('renders employee export page', () => {
    render(<BrowserRouter><EmployeeExport /></BrowserRouter>);
    expect(screen.getByText(/export/i)).toBeInTheDocument();
  });
});