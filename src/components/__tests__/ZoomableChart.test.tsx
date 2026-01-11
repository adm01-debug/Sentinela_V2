import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZoomableChart } from '../ZoomableChart';
describe('ZoomableChart', () => {
  const data = [{ x: 1, y: 10 }, { x: 2, y: 20 }];
  it('renders', () => { render(<ZoomableChart data={data} />); expect(screen.getByTestId('zoomable-chart')).toBeInTheDocument(); });
  it('zooms in', () => { render(<ZoomableChart data={data} />); fireEvent.click(screen.getByRole('button', { name: /zoom in/i })); expect(screen.getByTestId('zoom-level')).toHaveTextContent('2x'); });
  it('zooms out', () => { render(<ZoomableChart data={data} initialZoom={2} />); fireEvent.click(screen.getByRole('button', { name: /zoom out/i })); expect(screen.getByTestId('zoom-level')).toHaveTextContent('1x'); });
  it('resets zoom', () => { render(<ZoomableChart data={data} initialZoom={3} />); fireEvent.click(screen.getByRole('button', { name: /reset/i })); expect(screen.getByTestId('zoom-level')).toHaveTextContent('1x'); });
});