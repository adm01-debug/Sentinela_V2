import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { BrowserRouter } from 'react-router-dom';
const wrap = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);
describe('Header', () => {
  it('renders header', () => { wrap(<Header />); expect(screen.getByRole('banner')).toBeInTheDocument(); });
  it('shows logo', () => { wrap(<Header />); expect(screen.getByAltText(/logo/i)).toBeInTheDocument(); });
  it('shows user menu', () => { wrap(<Header user={{ name: 'John' }} />); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('shows notifications bell', () => { wrap(<Header />); expect(screen.getByTestId('notification-bell')).toBeInTheDocument(); });
  it('shows search', () => { wrap(<Header showSearch />); expect(screen.getByRole('searchbox')).toBeInTheDocument(); });
});