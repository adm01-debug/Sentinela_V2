import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppSidebar } from '../AppSidebar';
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('AppSidebar', () => {
  it('renders navigation items', () => { renderWithRouter(<AppSidebar />); expect(screen.getByText(/dashboard/i)).toBeInTheDocument(); });
  it('collapses sidebar', () => { renderWithRouter(<AppSidebar collapsible />); fireEvent.click(screen.getByTestId('collapse-btn')); expect(screen.getByTestId('sidebar')).toHaveClass('collapsed'); });
  it('highlights active route', () => { renderWithRouter(<AppSidebar />); expect(screen.getByRole('link', { current: 'page' })).toBeInTheDocument(); });
  it('shows user profile', () => { renderWithRouter(<AppSidebar user={{ name: 'John' }} />); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('handles logout', () => { const onLogout = vi.fn(); renderWithRouter(<AppSidebar onLogout={onLogout} />); fireEvent.click(screen.getByText(/logout/i)); expect(onLogout).toHaveBeenCalled(); });
});