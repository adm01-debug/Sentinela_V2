import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { List, ListItem } from '../List';

describe('List', () => {
  it('renders items', () => {
    render(
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
      </List>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders with dividers', () => {
    render(
      <List divided>
        <ListItem>A</ListItem>
        <ListItem>B</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toHaveClass('divided');
  });

  it('handles clickable items', () => {
    const onClick = vi.fn();
    render(
      <List>
        <ListItem clickable onClick={onClick}>Clickable</ListItem>
      </List>
    );
    fireEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalled();
  });
});