import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EmployeeEdit from '../EmployeeEdit';

describe('EmployeeEdit', () => {
  it('renders employee edit page', () => {
    render(<BrowserRouter><EmployeeEdit /></BrowserRouter>);
    expect(screen.getByText(/employee/i)).toBeInTheDocument();
  });
});