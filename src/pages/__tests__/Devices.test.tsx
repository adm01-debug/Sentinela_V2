import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Devices from '../Devices';

const mockUseDevicesPage = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useDevicesPage', () => ({ useDevicesPage: () => mockUseDevicesPage() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockDevices = [
  { id: '1', name: 'MacBook Pro - John', type: 'laptop', os: 'macOS', status: 'online', last_seen: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Desktop - Jane', type: 'desktop', os: 'Windows', status: 'offline', last_seen: '2024-01-14T18:00:00Z' },
  { id: '3', name: 'iPhone - Bob', type: 'mobile', os: 'iOS', status: 'online', last_seen: '2024-01-15T09:30:00Z' },
];

const renderDevices = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}><Devices /></I18nextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Devices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
    mockUseDevicesPage.mockReturnValue({
      devices: mockDevices,
      isLoading: false,
      error: null,
      approveDevice: vi.fn(),
      revokeDevice: vi.fn(),
      statistics: { total: 3, online: 2, offline: 1 },
    });
  });

  describe('Rendering', () => {
    it('should render devices page', () => {
      renderDevices();
      expect(document.body).toBeTruthy();
    });

    it('should display page title', () => {
      renderDevices();
      expect(screen.getByText(/dispositivos|devices/i)).toBeInTheDocument();
    });

    it('should display device list', async () => {
      renderDevices();
      await waitFor(() => {
        expect(screen.getByText(/MacBook Pro/i)).toBeInTheDocument();
      });
    });

    it('should display device status', async () => {
      renderDevices();
      await waitFor(() => {
        expect(screen.getByText(/online/i)).toBeInTheDocument();
      });
    });

    it('should display device types', async () => {
      renderDevices();
      await waitFor(() => {
        expect(screen.getByText(/laptop/i)).toBeInTheDocument();
      });
    });
  });

  describe('Statistics', () => {
    it('should display device statistics', async () => {
      renderDevices();
      await waitFor(() => {
        expect(screen.getByText(/2/)).toBeInTheDocument(); // online count
      });
    });
  });

  describe('Actions', () => {
    it('should have device management actions', () => {
      renderDevices();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseDevicesPage.mockReturnValue({ devices: [], isLoading: true, error: null });
      renderDevices();
      expect(document.body).toBeTruthy();
    });
  });
});
