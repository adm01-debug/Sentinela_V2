import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartLegend } from '../ChartLegend';
describe('ChartLegend', () => {
  const items = [{ label: 'Series A', color: '#ff0000' }, { label: 'Series B', color: '#00ff00' }];
  it('renders items', () => { render(<ChartLegend items={items} />); expect(screen.getByText('Series A')).toBeInTheDocument(); });
  it('shows colors', () => { render(<ChartLegend items={items} />); expect(screen.getAllByTestId('legend-color')[0]).toHaveStyle({ backgroundColor: '#ff0000' }); });
  it('toggles visibility', () => { const onToggle = vi.fn(); render(<ChartLegend items={items} onToggle={onToggle} />); fireEvent.click(screen.getByText('Series A')); expect(onToggle).toHaveBeenCalledWith('Series A'); });
});