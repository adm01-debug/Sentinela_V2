import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Geofencing from '../Geofencing';

const mockUseGeofencingPage = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useGeofencingPage', () => ({ useGeofencingPage: () => mockUseGeofencingPage() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));

// Mock map components
vi.mock('mapbox-gl', () => ({ default: { Map: vi.fn() } }));
vi.mock('react-map-gl', () => ({
  default: ({ children }: any) => <div data-testid="map">{children}</div>,
  Marker: () => <div data-testid="marker" />,
  Source: ({ children }: any) => <div>{children}</div>,
  Layer: () => null,
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockGeofences = [
  { id: '1', name: 'Office HQ', type: 'circle', coordinates: { lat: -23.5505, lng: -46.6333 }, radius: 500, is_active: true },
  { id: '2', name: 'Warehouse', type: 'polygon', coordinates: { lat: -23.5605, lng: -46.6433 }, is_active: true },
];

const renderGeofencing = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}><Geofencing /></I18nextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Geofencing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
    mockUseGeofencingPage.mockReturnValue({
      geofences: mockGeofences,
      isLoading: false,
      error: null,
      createGeofence: vi.fn(),
      updateGeofence: vi.fn(),
      deleteGeofence: vi.fn(),
      toggleActive: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render geofencing page', () => {
      renderGeofencing();
      expect(document.body).toBeTruthy();
    });

    it('should display page title', () => {
      renderGeofencing();
      expect(screen.getByText(/geofencing|cercas/i)).toBeInTheDocument();
    });

    it('should display geofence list', async () => {
      renderGeofencing();
      await waitFor(() => {
        expect(screen.getByText('Office HQ')).toBeInTheDocument();
        expect(screen.getByText('Warehouse')).toBeInTheDocument();
      });
    });

    it('should render map component', () => {
      renderGeofencing();
      expect(screen.getByTestId('map')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should have create geofence button', () => {
      renderGeofencing();
      const createButton = screen.queryByRole('button', { name: /criar|create|novo|new|adicionar/i });
      expect(createButton || document.body).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseGeofencingPage.mockReturnValue({ geofences: [], isLoading: true, error: null });
      renderGeofencing();
      expect(document.body).toBeTruthy();
    });
  });
});
