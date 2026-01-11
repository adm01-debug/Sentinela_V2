import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamCard } from '../TeamCard';
describe('TeamCard', () => {
  const team = { id: '1', name: 'Engineering', members: 15, lead: 'John' };
  it('renders', () => { render(<TeamCard team={team} />); expect(screen.getByText('Engineering')).toBeInTheDocument(); });
  it('shows members', () => { render(<TeamCard team={team} />); expect(screen.getByText('15 members')).toBeInTheDocument(); });
  it('shows lead', () => { render(<TeamCard team={team} />); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('handles click', () => { const onClick = vi.fn(); render(<TeamCard team={team} onClick={onClick} />); fireEvent.click(screen.getByText('Engineering')); expect(onClick).toHaveBeenCalled(); });
});