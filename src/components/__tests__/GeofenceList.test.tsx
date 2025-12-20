import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GeofenceList } from '../geofencing/GeofenceList';

const mockGeofences = [
  {
    id: '1',
    name: 'Office HQ',
    type: 'circle' as const,
    color: '#3b82f6',
    is_active: true,
    restricted: false,
    required: true,
    employees_count: 25,
  },
  {
    id: '2',
    name: 'Restricted Area',
    type: 'polygon' as const,
    color: '#ef4444',
    is_active: true,
    restricted: true,
    required: false,
    employees_count: 0,
  },
];

describe('GeofenceList', () => {
  const mockHandlers = {
    onSelect: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggle: vi.fn(),
  };

  it('renders geofences', () => {
    render(
      <GeofenceList
        geofences={mockGeofences}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Office HQ')).toBeInTheDocument();
    expect(screen.getByText('Restricted Area')).toBeInTheDocument();
  });

  it('shows empty state when no geofences', () => {
    render(
      <GeofenceList
        geofences={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/nenhuma geofence/i)).toBeInTheDocument();
  });

  it('shows restricted badge for restricted geofences', () => {
    render(
      <GeofenceList
        geofences={mockGeofences}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/restrita/i)).toBeInTheDocument();
  });

  it('shows required badge for required geofences', () => {
    render(
      <GeofenceList
        geofences={mockGeofences}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/obrigat/i)).toBeInTheDocument();
  });
});
