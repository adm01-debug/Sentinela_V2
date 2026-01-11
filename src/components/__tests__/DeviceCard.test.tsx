import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeviceCard } from '../DeviceCard';
describe('DeviceCard', () => {
  const device = { id: '1', name: 'MacBook Pro', type: 'laptop', lastSeen: '2026-01-01', status: 'online' };
  it('renders device name', () => { render(<DeviceCard device={device} />); expect(screen.getByText('MacBook Pro')).toBeInTheDocument(); });
  it('shows device type icon', () => { render(<DeviceCard device={device} />); expect(screen.getByTestId('laptop-icon')).toBeInTheDocument(); });
  it('shows online status', () => { render(<DeviceCard device={device} />); expect(screen.getByText('online')).toHaveClass('text-green'); });
  it('shows last seen', () => { render(<DeviceCard device={device} />); expect(screen.getByText(/last seen/i)).toBeInTheDocument(); });
});