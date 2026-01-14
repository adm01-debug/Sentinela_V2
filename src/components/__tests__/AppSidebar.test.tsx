import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from '../AppSidebar';
import { BrowserRouter } from 'react-router-dom';

// Mock the stores and constants
vi.mock('@/stores', () => ({
  useUIStore: () => ({
    sidebarCollapsed: false,
    toggleSidebarCollapse: vi.fn(),
  }),
}));

vi.mock('@/constants', () => ({
  ROUTES: {
    DASHBOARD: '/dashboard',
    EMPLOYEES: '/employees',
    ACTIVITIES: '/activities',
    REPORTS: '/reports',
    ALERTS: '/alerts',
    SETTINGS: '/settings',
  },
  APP_NAME: 'WorkWatch',
}));

const renderWithRouter = (ui: React.ReactElement) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('AppSidebar', () => {
  // AppSidebar takes no props - uses internal hooks
  it('renders navigation items', () => {
    renderWithRouter(<AppSidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders app name', () => {
    renderWithRouter(<AppSidebar />);
    expect(screen.getByText('WorkWatch')).toBeInTheDocument();
  });

  it('renders employees link', () => {
    renderWithRouter(<AppSidebar />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
  });

  it('renders settings link', () => {
    renderWithRouter(<AppSidebar />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
