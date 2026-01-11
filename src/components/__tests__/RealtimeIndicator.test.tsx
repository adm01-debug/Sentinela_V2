import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RealtimeIndicator } from '../RealtimeIndicator';
describe('RealtimeIndicator', () => {
  it('shows connected status', () => { render(<RealtimeIndicator connected />); expect(screen.getByText(/connected/i)).toBeInTheDocument(); });
  it('shows disconnected status', () => { render(<RealtimeIndicator connected={false} />); expect(screen.getByText(/disconnected/i)).toBeInTheDocument(); });
  it('shows pulsing dot when connected', () => { render(<RealtimeIndicator connected />); expect(screen.getByTestId('pulse-dot')).toHaveClass('animate-pulse'); });
  it('shows last update time', () => { render(<RealtimeIndicator connected lastUpdate="2 seconds ago" />); expect(screen.getByText('2 seconds ago')).toBeInTheDocument(); });
});