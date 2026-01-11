import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
describe('EmptyState', () => {
  it('renders message', () => { render(<EmptyState message="No data found" />); expect(screen.getByText('No data found')).toBeInTheDocument(); });
  it('shows action', () => { const onAction = vi.fn(); render(<EmptyState message="Empty" action={{ label: 'Add', onClick: onAction }} />); fireEvent.click(screen.getByText('Add')); expect(onAction).toHaveBeenCalled(); });
  it('shows icon', () => { render(<EmptyState message="Empty" icon="inbox" />); expect(screen.getByTestId('icon-inbox')).toBeInTheDocument(); });
});