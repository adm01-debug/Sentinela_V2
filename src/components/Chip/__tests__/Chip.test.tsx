import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from '../Chip';

describe('Chip', () => {
  it('renders text', () => {
    render(<Chip>Tag</Chip>);
    expect(screen.getByText('Tag')).toBeInTheDocument();
  });

  it('handles click', () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Clickable</Chip>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalled();
  });

  it('handles delete', () => {
    const onDelete = vi.fn();
    render(<Chip onDelete={onDelete}>Deletable</Chip>);
    fireEvent.click(screen.getByTestId('chip-delete'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('renders avatar', () => {
    render(<Chip avatar="JD">John Doe</Chip>);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies color', () => {
    render(<Chip color="success">Success</Chip>);
    expect(screen.getByTestId('chip')).toHaveClass('success');
  });
});