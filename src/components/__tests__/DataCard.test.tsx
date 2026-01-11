import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataCard } from '../DataCard';
describe('DataCard', () => {
  it('renders title', () => { render(<DataCard title="Stats" value={100} />); expect(screen.getByText('Stats')).toBeInTheDocument(); });
  it('renders value', () => { render(<DataCard title="Stats" value={100} />); expect(screen.getByText('100')).toBeInTheDocument(); });
  it('handles click', () => { const onClick = vi.fn(); render(<DataCard title="Stats" value={100} onClick={onClick} />); fireEvent.click(screen.getByText('Stats')); expect(onClick).toHaveBeenCalled(); });
});