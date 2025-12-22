import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EmployeeCreate from '../EmployeeCreate';

describe('EmployeeCreate', () => {
  it('renders employee create page', () => {
    render(<BrowserRouter><EmployeeCreate /></BrowserRouter>);
    expect(screen.getByText(/employee/i)).toBeInTheDocument();
  });
});