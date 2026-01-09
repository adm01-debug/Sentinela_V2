import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Menu, MenuItem, MenuDivider } from '../Menu';

describe('Menu', () => {
  it('renders items', () => {
    render(
      <Menu>
        <MenuItem>Item 1</MenuItem>
        <MenuItem>Item 2</MenuItem>
      </Menu>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('handles item click', () => {
    const onClick = vi.fn();
    render(
      <Menu>
        <MenuItem onClick={onClick}>Click me</MenuItem>
      </Menu>
    );
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders divider', () => {
    render(
      <Menu>
        <MenuItem>A</MenuItem>
        <MenuDivider />
        <MenuItem>B</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('shows keyboard shortcut', () => {
    render(
      <Menu>
        <MenuItem shortcut="⌘S">Save</MenuItem>
      </Menu>
    );
    expect(screen.getByText('⌘S')).toBeInTheDocument();
  });
});