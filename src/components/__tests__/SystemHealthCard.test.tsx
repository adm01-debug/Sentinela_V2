import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemHealthCard } from '../SystemHealthCard';
describe('SystemHealthCard', () => {
  const health = { cpu: 45, memory: 60, disk: 30, status: 'healthy' };
  it('renders', () => { render(<SystemHealthCard health={health} />); expect(screen.getByText('System Health')).toBeInTheDocument(); });
  it('shows metrics', () => { render(<SystemHealthCard health={health} />); expect(screen.getByText('45%')).toBeInTheDocument(); });
  it('shows status', () => { render(<SystemHealthCard health={health} />); expect(screen.getByText('healthy')).toBeInTheDocument(); });
  it('warning status', () => { render(<SystemHealthCard health={{ ...health, status: 'warning' }} />); expect(screen.getByText('warning')).toHaveClass('text-yellow'); });
});