import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommandPalette } from '../CommandPalette';

vi.mock('@/hooks/useCommandPalette', () => ({
  useCommandPalette: () => ({
    isOpen: true,
    close: vi.fn(),
    query: '',
    setQuery: vi.fn(),
    groups: [{ id: 'nav', label: 'Navigation', commands: [{ id: 'home', label: 'Home', action: vi.fn() }] }],
    selectedIndex: 0,
    executeCommand: vi.fn(),
  }),
}));

describe('CommandPalette', () => {
  it('should render when open', () => {
    render(<CommandPalette />);
    expect(screen.getByPlaceholderText(/comando/i)).toBeInTheDocument();
  });

  it('should show command groups', () => {
    render(<CommandPalette />);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
