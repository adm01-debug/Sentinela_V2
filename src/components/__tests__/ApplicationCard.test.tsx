import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApplicationCard } from '../ApplicationCard';
describe('ApplicationCard', () => {
  const app = { id: '1', name: 'Chrome', icon: '🌐', usage: 120 };
  it('renders app name', () => { render(<ApplicationCard app={app} />); expect(screen.getByText('Chrome')).toBeInTheDocument(); });
  it('shows usage time', () => { render(<ApplicationCard app={app} />); expect(screen.getByText('2h 0m')).toBeInTheDocument(); });
  it('displays icon', () => { render(<ApplicationCard app={app} />); expect(screen.getByText('🌐')).toBeInTheDocument(); });
  it('handles click', () => { const onClick = vi.fn(); render(<ApplicationCard app={app} onClick={onClick} />); screen.getByText('Chrome').click(); expect(onClick).toHaveBeenCalled(); });
});