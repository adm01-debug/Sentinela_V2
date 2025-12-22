import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EmployeeImport from '../EmployeeImport';

describe('EmployeeImport', () => {
  it('renders employee import page', () => {
    render(<BrowserRouter><EmployeeImport /></BrowserRouter>);
    expect(screen.getByText(/import/i)).toBeInTheDocument();
  });
});