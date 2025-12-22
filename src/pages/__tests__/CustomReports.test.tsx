import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CustomReports from '../CustomReports';

describe('CustomReports', () => {
  it('renders custom reports page', () => {
    render(<BrowserRouter><CustomReports /></BrowserRouter>);
    expect(screen.getByText(/report/i)).toBeInTheDocument();
  });
});